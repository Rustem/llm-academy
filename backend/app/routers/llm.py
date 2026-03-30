import json
import logging

from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.llm import ChatReq, ChatResp, EvaluateReq, EvaluateResp
from app.services.llm import call_openrouter, build_evaluation_prompt, parse_evaluation_response
from app.services.course_loader import load_course

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
    try:
        data = load_course(req.course_id)
    except HTTPException:
        raise HTTPException(status_code=404, detail="Course not found")

    exercise = next((e for e in data["exercises"] if e["id"] == req.exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    system_prompt, user_message = build_evaluation_prompt(exercise, req.user_prompt, req.ai_response)

    try:
        raw = await call_openrouter(
            model=req.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        result = parse_evaluation_response(raw)
        return EvaluateResp(**result)
    except json.JSONDecodeError:
        return EvaluateResp(stars=3, feedback=raw, strengths=[], improvements=[], tip="")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Evaluation failed: {str(e)}")
