"""Public API for third-party integrations.

Provides read-only access to courses, exercises, and templates.
No authentication required.
"""

from fastapi import APIRouter

from app.services.course_loader import load_course, list_all_courses, get_exercise as get_exercise_with_material
from app.routers.templates import _load_templates

router = APIRouter(prefix="/api/v1", tags=["public-api"])


@router.get("/info")
def api_info():
    return {
        "name": "LLM Academy Public API",
        "version": "1.0",
        "description": "Read-only API for courses, exercises, and prompt templates",
        "endpoints": {
            "GET /api/v1/info": "This endpoint",
            "GET /api/v1/courses": "List all courses",
            "GET /api/v1/courses/{id}": "Course details with exercise list",
            "GET /api/v1/courses/{id}/exercises": "All exercises for a course",
            "GET /api/v1/courses/{id}/exercises/{eid}": "Single exercise with materials",
            "GET /api/v1/templates": "Prompt templates (filterable by ?course=X&technique=Y)",
        },
    }


@router.get("/courses")
def list_courses():
    courses = list_all_courses()
    return {"courses": courses, "total": len(courses)}


@router.get("/courses/{course_id}")
def get_course(course_id: str):
    data = load_course(course_id)
    exercises = [
        {"id": e["id"], "title": e["title"], "module": e["m"], "difficulty": e["d"], "xp": e["xp"]}
        for e in data["exercises"]
    ]
    return {"course": data["course"], "exercises": exercises}


@router.get("/courses/{course_id}/exercises")
def list_exercises(course_id: str):
    data = load_course(course_id)
    return {"course_id": course_id, "exercises": data["exercises"], "total": len(data["exercises"])}


@router.get("/courses/{course_id}/exercises/{exercise_id}")
def get_exercise(course_id: str, exercise_id: int):
    return get_exercise_with_material(course_id, exercise_id)


@router.get("/templates")
def list_templates(course: str | None = None, technique: str | None = None):
    templates = _load_templates()
    if course:
        templates = [t for t in templates if course in t.get("courses", [])]
    if technique:
        templates = [t for t in templates if t.get("technique") == technique]
    return {"templates": templates, "total": len(templates)}
