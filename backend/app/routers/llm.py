import json
import logging

from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.llm import ChatReq, ChatResp, EvaluateReq, EvaluateResp
from app.services.llm import call_openrouter

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.post("/chat", response_model=ChatResp)
async def chat(
    req: ChatReq,
    current_user: User = Depends(get_current_user),
):
    try:
        content = await call_openrouter(
            model=req.model,
            messages=[
                {"role": "system", "content": req.system_prompt},
                {"role": "user", "content": req.user_message},
            ],
            max_tokens=req.max_tokens,
            temperature=req.temperature,
        )
        return ChatResp(content=content, model=req.model)
    except Exception as e:
        logger.exception("LLM chat call failed")
        raise HTTPException(status_code=502, detail=f"LLM call failed: {str(e)}")


@router.post("/evaluate", response_model=EvaluateResp)
async def evaluate(
    req: EvaluateReq,
    current_user: User = Depends(get_current_user),
):
    from app.routers.exercises import load_exercises

    exercises = load_exercises()
    exercise = next((e for e in exercises if e["id"] == req.exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    system_prompt = (
        'You are an expert prompt engineering coach. Score 1-5 stars. '
        'Respond ONLY in JSON, no fences:\n'
        '{"stars":3,"feedback":"...","strengths":["..."],"improvements":["..."],"tip":"..."}'
    )
    user_message = (
        f"EXERCISE: {exercise['title']}\n"
        f"SCENARIO: {exercise['sc']}\n"
        f"TASK: {exercise['task']}\n"
        f"CRITERIA: {exercise['cr']}\n\n"
        f"USER PROMPT:\n{req.user_prompt}\n\n"
        f"AI RESPONSE:\n{req.ai_response}"
    )

    try:
        raw = await call_openrouter(
            model=req.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        return EvaluateResp(
            stars=parsed.get("stars", 3),
            feedback=parsed.get("feedback", raw),
            strengths=parsed.get("strengths", []),
            improvements=parsed.get("improvements", []),
            tip=parsed.get("tip", ""),
        )
    except json.JSONDecodeError:
        return EvaluateResp(stars=3, feedback=raw, strengths=[], improvements=[], tip="")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Evaluation failed: {str(e)}")
