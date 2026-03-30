from pydantic import BaseModel


class CompleteExerciseReq(BaseModel):
    exercise_id: int
    course_id: str = "general"
    stars: int
    xp_earned: int
    prompt_used: str | None = None
    ai_response: str | None = None
    model_used: str | None = None


class CompletedExerciseOut(BaseModel):
    exercise_id: int
    stars: int
    xp_earned: int
    prompt_used: str | None = None
    attempt_count: int = 1
    completed_at: str | None = None

    model_config = {"from_attributes": True}


class AttemptOut(BaseModel):
    id: int
    attempt_number: int
    stars: int
    xp_earned: int
    prompt_used: str | None = None
    ai_response: str | None = None
    model_used: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}


class ProgressOut(BaseModel):
    total_xp: int
    level: str
    completed: dict[int, CompletedExerciseOut]
