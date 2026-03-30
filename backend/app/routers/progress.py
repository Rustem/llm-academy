from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user, get_progress_repo
from app.models.user import User
from app.repositories.progress_repo import ProgressRepository
from app.schemas.progress import CompleteExerciseReq, ProgressOut
from app.services.progress import build_progress_response
from app.services.course_loader import load_course

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("", response_model=ProgressOut)
def get_progress(
    course: str = Query("general"),
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    completed = progress_repo.get_all_for_user(current_user.id, course_id=course)
    return build_progress_response(completed)


@router.post("/complete", response_model=ProgressOut)
def complete_exercise(
    req: CompleteExerciseReq,
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    progress_repo.upsert(
        user_id=current_user.id,
        exercise_id=req.exercise_id,
        course_id=req.course_id,
        stars=req.stars,
        xp_earned=req.xp_earned,
        prompt_used=req.prompt_used,
    )
    completed = progress_repo.get_all_for_user(current_user.id, course_id=req.course_id)
    return build_progress_response(completed)


@router.get("/prompts")
def get_my_prompts(
    course: str = Query("general"),
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    completed = progress_repo.get_all_for_user(current_user.id, course_id=course)
    completed = [c for c in completed if c.prompt_used]
    try:
        course_data = load_course(course)
        exercises = {e["id"]: e for e in course_data["exercises"]}
    except Exception:
        exercises = {}

    return [
        {
            "exercise_id": c.exercise_id,
            "course_id": c.course_id,
            "title": exercises.get(c.exercise_id, {}).get("title", f"Exercise {c.exercise_id}"),
            "stars": c.stars,
            "xp_earned": c.xp_earned,
            "prompt": c.prompt_used,
            "completed_at": c.completed_at.isoformat() if c.completed_at else None,
        }
        for c in sorted(completed, key=lambda x: x.stars, reverse=True)
    ]
