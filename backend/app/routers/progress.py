from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, get_progress_repo
from app.models.user import User
from app.models.progress import CompletedExercise, ExerciseAttempt
from app.repositories.progress_repo import ProgressRepository
from app.schemas.progress import CompleteExerciseReq, AttemptOut, ProgressOut
from app.services.progress import build_progress_response
from app.services.course_loader import load_course

router = APIRouter(prefix="/api/progress", tags=["progress"])

MAX_ATTEMPTS = 10


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
    db: Session = Depends(get_db),
):
    # 1. Count existing attempts for this exercise
    attempt_count = (
        db.query(ExerciseAttempt)
        .filter(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.course_id == req.course_id,
            ExerciseAttempt.exercise_id == req.exercise_id,
        )
        .count()
    )

    # 2. Create attempt record
    attempt = ExerciseAttempt(
        user_id=current_user.id,
        course_id=req.course_id,
        exercise_id=req.exercise_id,
        attempt_number=attempt_count + 1,
        stars=req.stars,
        xp_earned=req.xp_earned,
        prompt_used=req.prompt_used,
        ai_response=req.ai_response,
        model_used=req.model_used,
    )
    db.add(attempt)

    # 3. Enforce max 10 attempts — delete oldest if over limit
    if attempt_count >= MAX_ATTEMPTS:
        oldest = (
            db.query(ExerciseAttempt)
            .filter(
                ExerciseAttempt.user_id == current_user.id,
                ExerciseAttempt.course_id == req.course_id,
                ExerciseAttempt.exercise_id == req.exercise_id,
            )
            .order_by(ExerciseAttempt.created_at.asc())
            .first()
        )
        if oldest:
            db.delete(oldest)

    db.flush()

    # 4. Upsert CompletedExercise with latest result (always update)
    progress_repo.upsert(
        user_id=current_user.id,
        exercise_id=req.exercise_id,
        course_id=req.course_id,
        stars=req.stars,
        xp_earned=req.xp_earned,
        prompt_used=req.prompt_used,
        attempt_count=attempt_count + 1,
    )

    completed = progress_repo.get_all_for_user(current_user.id, course_id=req.course_id)
    return build_progress_response(completed)


@router.get("/attempts/{exercise_id}")
def get_attempts(
    exercise_id: int,
    course: str = Query("general"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(ExerciseAttempt)
        .filter(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.course_id == course,
            ExerciseAttempt.exercise_id == exercise_id,
        )
        .order_by(ExerciseAttempt.created_at.desc())
        .limit(MAX_ATTEMPTS)
        .all()
    )
    return [
        AttemptOut(
            id=a.id,
            attempt_number=a.attempt_number,
            stars=a.stars,
            xp_earned=a.xp_earned,
            prompt_used=a.prompt_used,
            ai_response=a.ai_response,
            model_used=a.model_used,
            created_at=a.created_at.isoformat() if a.created_at else None,
        )
        for a in attempts
    ]


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
