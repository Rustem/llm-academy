from pydantic import BaseModel


class CompleteExerciseReq(BaseModel):
    exercise_id: int
    stars: int
    xp_earned: int
    prompt_used: str | None = None


class CompletedExerciseOut(BaseModel):
    exercise_id: int
    stars: int
    xp_earned: int
    completed_at: str | None = None

    model_config = {"from_attributes": True}


class ProgressOut(BaseModel):
    total_xp: int
    level: str
    completed: dict[int, CompletedExerciseOut]
