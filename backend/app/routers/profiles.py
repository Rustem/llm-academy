from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils import extract_username
from app.models.progress import CompletedExercise
from app.models.user import User
from app.services.progress import get_level

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("/{username}")
def get_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.like(f"{username}@%")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    completed = db.query(CompletedExercise).filter(CompletedExercise.user_id == user.id).all()
    total_xp = sum(c.xp_earned for c in completed)

    # Per-course stats
    courses = {}
    for c in completed:
        if c.course_id not in courses:
            courses[c.course_id] = {"exercises": 0, "xp": 0, "stars": 0}
        courses[c.course_id]["exercises"] += 1
        courses[c.course_id]["xp"] += c.xp_earned
        courses[c.course_id]["stars"] += c.stars

    return {
        "username": extract_username(user.email),
        "profession": user.profession,
        "total_xp": total_xp,
        "level": get_level(total_xp),
        "exercises_completed": len(completed),
        "member_since": user.created_at.isoformat() if user.created_at else None,
        "courses": courses,
    }
