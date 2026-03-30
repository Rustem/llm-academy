from fastapi import APIRouter

from app.services.course_loader import load_course, list_all_courses, get_exercise

router = APIRouter(tags=["exercises"])


# ── Course endpoints ───────────────────────────────────────────

@router.get("/api/courses")
def list_courses():
    return list_all_courses()


@router.get("/api/courses/{course_id}/exercises")
def list_course_exercises(course_id: str):
    data = load_course(course_id)
    return data["exercises"]


@router.get("/api/courses/{course_id}/exercises/{exercise_id}")
def get_course_exercise(course_id: str, exercise_id: int):
    return get_exercise(course_id, exercise_id)


# ── Backward-compat: /api/exercises → general course ──────────

@router.get("/api/exercises")
def list_exercises():
    data = load_course("general")
    return data["exercises"]


@router.get("/api/exercises/{exercise_id}")
def get_exercise_compat(exercise_id: int):
    return get_exercise("general", exercise_id)
