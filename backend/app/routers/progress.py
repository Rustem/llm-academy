from fastapi import APIRouter, Depends

from app.dependencies import get_current_user, get_progress_repo
from app.models.user import User
from app.repositories.progress_repo import ProgressRepository
from app.schemas.progress import CompleteExerciseReq, CompletedExerciseOut, ProgressOut
from app.services.progress import get_level

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("", response_model=ProgressOut)
def get_progress(
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    completed = progress_repo.get_all_for_user(current_user.id)
    total_xp = sum(c.xp_earned for c in completed)
    return ProgressOut(
        total_xp=total_xp,
        level=get_level(total_xp),
        completed={
            c.exercise_id: CompletedExerciseOut(
                exercise_id=c.exercise_id,
                stars=c.stars,
                xp_earned=c.xp_earned,
                completed_at=c.completed_at.isoformat() if c.completed_at else None,
            )
            for c in completed
        },
    )


@router.post("/complete", response_model=ProgressOut)
def complete_exercise(
    req: CompleteExerciseReq,
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    progress_repo.upsert(
        user_id=current_user.id,
        exercise_id=req.exercise_id,
        stars=req.stars,
        xp_earned=req.xp_earned,
        prompt_used=req.prompt_used,
    )
    completed = progress_repo.get_all_for_user(current_user.id)
    total_xp = sum(c.xp_earned for c in completed)
    return ProgressOut(
        total_xp=total_xp,
        level=get_level(total_xp),
        completed={
            c.exercise_id: CompletedExerciseOut(
                exercise_id=c.exercise_id,
                stars=c.stars,
                xp_earned=c.xp_earned,
                completed_at=c.completed_at.isoformat() if c.completed_at else None,
            )
            for c in completed
        },
    )
