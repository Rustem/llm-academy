"""P0 regression tests — covers bugs that actually broke production.

Each test documents what broke and why, so we never regress.
"""

import json
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.utils import extract_username, clean_llm_json, to_list, safe_int
from app.services.llm import parse_evaluation_response, build_evaluation_prompt
from app.services.progress import get_level, build_progress_response
from app.services.course_loader import load_course, list_all_courses, get_exercise


client = TestClient(app)


# ── Bug: LLM returned strengths/improvements as string, not list ──
# Pydantic rejected the response with "Input should be a valid list"

class TestParseEvaluationResponse:
    def test_normal_response(self):
        raw = '{"stars":4,"feedback":"Good","strengths":["Clear"],"improvements":["Add more"],"tip":"Try X"}'
        result = parse_evaluation_response(raw)
        assert result["stars"] == 4
        assert result["strengths"] == ["Clear"]
        assert result["improvements"] == ["Add more"]

    def test_strengths_as_string(self):
        """Bug: some models return a string instead of array."""
        raw = '{"stars":3,"feedback":"Ok","strengths":"Good job on clarity","improvements":"Be more specific","tip":""}'
        result = parse_evaluation_response(raw)
        assert result["strengths"] == ["Good job on clarity"]
        assert result["improvements"] == ["Be more specific"]

    def test_stars_as_string(self):
        """Bug: some models return stars as "4/5" or "4 stars"."""
        raw = '{"stars":"4","feedback":"Good","strengths":[],"improvements":[],"tip":""}'
        result = parse_evaluation_response(raw)
        assert result["stars"] == 4

    def test_stars_clamped(self):
        """Stars must be 1-5, never 0 or 10."""
        raw = '{"stars":0,"feedback":"Bad","strengths":[],"improvements":[],"tip":""}'
        assert parse_evaluation_response(raw)["stars"] == 1

        raw = '{"stars":10,"feedback":"Perfect","strengths":[],"improvements":[],"tip":""}'
        assert parse_evaluation_response(raw)["stars"] == 5

    def test_json_with_code_fences(self):
        """Bug: some models wrap JSON in ```json ... ``` fences."""
        raw = '```json\n{"stars":3,"feedback":"Ok","strengths":[],"improvements":[],"tip":""}\n```'
        result = parse_evaluation_response(raw)
        assert result["stars"] == 3

    def test_null_strengths(self):
        raw = '{"stars":3,"feedback":"Ok","strengths":null,"improvements":null,"tip":null}'
        result = parse_evaluation_response(raw)
        assert result["strengths"] == []
        assert result["improvements"] == []
        assert result["tip"] == "None"  # str(None)


# ── Bug: email.split("@")[0] duplicated in 5+ files ──
# Now centralized in utils.extract_username

class TestExtractUsername:
    def test_normal_email(self):
        assert extract_username("r.kamun@gmail.com") == "r.kamun"

    def test_no_domain(self):
        assert extract_username("nodomain") == "nodomain"


# ── Bug: to_list and safe_int edge cases ──

class TestToList:
    def test_list_passthrough(self):
        assert to_list(["a", "b"]) == ["a", "b"]

    def test_string_wraps(self):
        assert to_list("hello") == ["hello"]

    def test_none_returns_empty(self):
        assert to_list(None) == []

    def test_empty_string_returns_empty(self):
        assert to_list("") == []


class TestSafeInt:
    def test_int_passthrough(self):
        assert safe_int(5) == 5

    def test_string_parsing(self):
        assert safe_int("42") == 42

    def test_string_with_text(self):
        assert safe_int("4 stars") == 4

    def test_clamping(self):
        assert safe_int(10, min_val=1, max_val=5) == 5
        assert safe_int(0, min_val=1, max_val=5) == 1

    def test_default_on_garbage(self):
        assert safe_int("no numbers", default=3) == 3

    def test_none(self):
        assert safe_int(None, default=7) == 7


# ── Course loading — ensures all 5 courses load with 23 exercises each ──

class TestCourseLoader:
    def test_list_all_courses(self):
        courses = list_all_courses()
        assert len(courses) == 5
        ids = {c["id"] for c in courses}
        assert ids == {"general", "medical", "education", "legal", "psychotherapy"}

    def test_load_course(self):
        data = load_course("general")
        assert len(data["exercises"]) == 23
        assert data["course"]["id"] == "general"

    def test_load_nonexistent_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc:
            load_course("nonexistent")
        assert exc.value.status_code == 404

    def test_get_exercise_with_material(self):
        ex = get_exercise("general", 1)
        assert ex["id"] == 1
        assert ex["title"] == "Vague vs. precise"
        assert ex["material"] is not None

    def test_xp_consistency_across_courses(self):
        """All courses must have identical XP values per exercise ID."""
        general = load_course("general")
        general_xp = {e["id"]: e["xp"] for e in general["exercises"]}
        for name in ["medical", "education", "legal", "psychotherapy"]:
            data = load_course(name)
            for ex in data["exercises"]:
                assert ex["xp"] == general_xp[ex["id"]], f"{name} ex {ex['id']}: xp {ex['xp']} != {general_xp[ex['id']]}"


# ── Progress service ──

class TestProgressService:
    def test_get_level(self):
        assert get_level(0) == "Newcomer"
        assert get_level(499) == "Newcomer"
        assert get_level(500) == "AI Explorer"
        assert get_level(3000) == "Prompt Architect"


# ── API endpoint smoke tests — catches routing/wiring breaks ──

class TestAPIEndpoints:
    def test_health(self):
        assert client.get("/api/health").status_code == 200

    def test_courses_list(self):
        resp = client.get("/api/courses")
        assert resp.status_code == 200
        assert len(resp.json()) == 5

    def test_course_exercises(self):
        resp = client.get("/api/courses/general/exercises")
        assert resp.status_code == 200
        assert len(resp.json()) == 23

    def test_single_exercise(self):
        resp = client.get("/api/courses/general/exercises/1")
        assert resp.status_code == 200
        assert resp.json()["title"] == "Vague vs. precise"

    def test_exercise_404(self):
        assert client.get("/api/courses/general/exercises/999").status_code == 404

    def test_course_404(self):
        assert client.get("/api/courses/nonexistent/exercises").status_code == 404

    def test_templates(self):
        resp = client.get("/api/templates")
        assert resp.status_code == 200
        assert len(resp.json()) > 0

    def test_templates_filtered(self):
        resp = client.get("/api/templates?course=medical")
        assert resp.status_code == 200
        for t in resp.json():
            assert "medical" in t["courses"]

    def test_leaderboard(self):
        assert client.get("/api/leaderboard").status_code == 200

    def test_public_api_info(self):
        resp = client.get("/api/v1/info")
        assert resp.status_code == 200
        assert "endpoints" in resp.json()

    def test_public_api_courses(self):
        resp = client.get("/api/v1/courses")
        assert resp.status_code == 200
        assert resp.json()["total"] == 5

    def test_backward_compat_exercises(self):
        """Old /api/exercises endpoint still works."""
        resp = client.get("/api/exercises")
        assert resp.status_code == 200
        assert len(resp.json()) == 23


# ── Auth-required endpoints return 401/403 without token ──

class TestAuthRequired:
    def test_progress_requires_auth(self):
        resp = client.get("/api/progress")
        assert resp.status_code in (401, 403)

    def test_classrooms_requires_auth(self):
        resp = client.get("/api/classrooms")
        assert resp.status_code in (401, 403)

    def test_admin_requires_auth(self):
        resp = client.get("/api/admin/stats")
        assert resp.status_code in (401, 403)
