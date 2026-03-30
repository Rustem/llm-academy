"""Centralized course data loading."""

import json
from pathlib import Path

from fastapi import HTTPException

COURSES_DIR = Path(__file__).parent.parent.parent / "data" / "courses"


def load_course(course_id: str) -> dict:
    """Load a course JSON file by ID. Raises 404 if not found."""
    path = COURSES_DIR / f"{course_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Course not found")
    with open(path) as f:
        return json.load(f)


def list_all_courses() -> list[dict]:
    """List all courses with metadata and exercise counts."""
    courses = []
    for path in sorted(COURSES_DIR.glob("*.json")):
        with open(path) as f:
            data = json.load(f)
        info = data["course"]
        info["exerciseCount"] = len(data.get("exercises", []))
        courses.append(info)
    return courses


def get_exercise(course_id: str, exercise_id: int) -> dict:
    """Load a single exercise with its material. Raises 404 if not found."""
    data = load_course(course_id)
    exercise = next((e for e in data["exercises"] if e["id"] == exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    materials = data.get("materials", {})
    exercise["material"] = materials.get(str(exercise_id))
    return exercise
