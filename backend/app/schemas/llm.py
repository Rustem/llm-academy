from pydantic import BaseModel


class ChatReq(BaseModel):
    system_prompt: str
    user_message: str
    model: str = "meta-llama/llama-3.3-70b-instruct:free"
    max_tokens: int = 1000
    temperature: float = 0.7


class ChatResp(BaseModel):
    content: str
    model: str


class EvaluateReq(BaseModel):
    exercise_id: int
    user_prompt: str
    ai_response: str
    model: str = "meta-llama/llama-3.3-70b-instruct:free"


class EvaluateResp(BaseModel):
    stars: int
    feedback: str
    strengths: list[str]
    improvements: list[str]
    tip: str
