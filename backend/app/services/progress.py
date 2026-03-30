"""Progress service: XP, levels, progress response building."""

from app.schemas.progress import CompletedExerciseOut, ProgressOut

LEVELS = [
    (3000, "Prompt Architect"),
    (2000, "AI Strategist"),
    (1200, "Prompt Crafter"),
    (500, "AI Explorer"),
    (0, "Newcomer"),
]


def get_level(xp: int) -> str:
    for threshold, name in LEVELS:
        if xp >= threshold:
            return name
    return "Newcomer"


def calc_xp(base_xp: int, stars: int) -> int:
    if stars >= 4:
        return base_xp
    return int(base_xp * 0.7)


def build_progress_response(completed: list, course_id: str | None = None) -> ProgressOut:
    """Build a ProgressOut response from a list of CompletedExercise records."""
    if course_id:
        completed = [c for c in completed if c.course_id == course_id]
    total_xp = sum(c.xp_earned for c in completed)
    return ProgressOut(
        total_xp=total_xp,
        level=get_level(total_xp),
        completed={
            c.exercise_id: CompletedExerciseOut(
                exercise_id=c.exercise_id,
                stars=c.stars,
                xp_earned=c.xp_earned,
                prompt_used=c.prompt_used,
                attempt_count=getattr(c, "attempt_count", 1) or 1,
                completed_at=c.completed_at.isoformat() if c.completed_at else None,
            )
            for c in completed
        },
    )
