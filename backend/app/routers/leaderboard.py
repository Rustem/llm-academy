from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils import extract_username
from app.models.progress import CompletedExercise
from app.models.user import User
from app.services.progress import get_level

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("")
def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            User.id,
            User.email,
            User.profession,
            func.coalesce(func.sum(CompletedExercise.xp_earned), 0).label("total_xp"),
            func.count(CompletedExercise.id).label("exercises_completed"),
        )
        .outerjoin(CompletedExercise, User.id == CompletedExercise.user_id)
        .group_by(User.id)
        .order_by(func.sum(CompletedExercise.xp_earned).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "rank": i + 1,
            "username": extract_username(row.email),
            "profession": row.profession,
            "total_xp": row.total_xp,
            "exercises_completed": row.exercises_completed,
            "level": get_level(row.total_xp),
        }
        for i, row in enumerate(rows)
    ]
