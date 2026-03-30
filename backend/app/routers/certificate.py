from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.progress import CompletedExercise
from app.services.progress import get_level
from app.services.certificate import generate_certificate
from app.constants import COURSE_TITLES, EXERCISES_PER_COURSE
from app.utils import extract_username

router = APIRouter(prefix="/api/certificate", tags=["certificate"])


@router.get("/{course_id}")
def download_certificate(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    completed = (
        db.query(CompletedExercise)
        .filter(CompletedExercise.user_id == current_user.id, CompletedExercise.course_id == course_id)
        .all()
    )

    if len(completed) < EXERCISES_PER_COURSE:
        raise HTTPException(status_code=400, detail=f"Course not completed ({len(completed)}/23 exercises)")

    total_xp = sum(c.xp_earned for c in completed)
    username = extract_username(current_user.email)
    course_title = COURSE_TITLES.get(course_id, course_id.title())

    last_completed = max(c.completed_at for c in completed if c.completed_at)
    date_str = last_completed.strftime("%B %d, %Y") if last_completed else None

    pdf_bytes = generate_certificate(
        username=username,
        course_title=course_title,
        total_xp=total_xp,
        exercises_completed=len(completed),
        level=get_level(total_xp),
        completed_date=date_str,
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=llm-academy-{course_id}-certificate.pdf"},
    )
