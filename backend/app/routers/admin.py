import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.progress import CompletedExercise
from app.constants import ADMIN_EMAILS

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(user: User):
    if user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/openrouter/usage")
async def get_openrouter_usage(
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=400, detail="No OpenRouter API key configured")

    headers = {"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Key info & usage
        key_resp = await client.get("https://openrouter.ai/api/v1/auth/key", headers=headers)
        key_data = key_resp.json().get("data", {}) if key_resp.status_code == 200 else {}

        # Generation stats
        gen_resp = await client.get("https://openrouter.ai/api/v1/generation/stats", headers=headers)
        gen_data = gen_resp.json().get("data", []) if gen_resp.status_code == 200 else []

        # Model info (pricing, context, limits)
        models_resp = await client.get("https://openrouter.ai/api/v1/models", headers=headers)
        all_models = models_resp.json().get("data", []) if models_resp.status_code == 200 else []

    # Build model info for our models + all free ones
    used_ids = {
        "anthropic/claude-sonnet-4", "openai/gpt-4o-mini", "openai/gpt-4.1-nano",
        "google/gemini-2.5-flash", "deepseek/deepseek-chat-v3-0324",
    }
    model_info = []
    for m in all_models:
        mid = m.get("id", "")
        if mid in used_ids or ":free" in mid:
            pricing = m.get("pricing", {})
            tp = m.get("top_provider", {})
            model_info.append({
                "id": mid,
                "name": m.get("name", mid),
                "context_length": m.get("context_length"),
                "max_output": tp.get("max_completion_tokens"),
                "price_prompt": pricing.get("prompt", "0"),
                "price_completion": pricing.get("completion", "0"),
                "is_free": ":free" in mid or pricing.get("prompt") == "0",
            })

    return {
        "key": {
            "label": key_data.get("label"),
            "is_free_tier": key_data.get("is_free_tier"),
            "limit": key_data.get("limit"),
            "limit_remaining": key_data.get("limit_remaining"),
            "limit_reset": key_data.get("limit_reset"),
            "usage": key_data.get("usage"),
            "usage_daily": key_data.get("usage_daily"),
            "usage_weekly": key_data.get("usage_weekly"),
            "usage_monthly": key_data.get("usage_monthly"),
        },
        "generation_stats": gen_data[:20],
        "models": sorted(model_info, key=lambda x: (not x["is_free"], x["name"])),
    }


@router.get("/stats")
def get_platform_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user)

    total_users = db.query(func.count(User.id)).scalar()
    total_completions = db.query(func.count(CompletedExercise.id)).scalar()
    total_xp = db.query(func.coalesce(func.sum(CompletedExercise.xp_earned), 0)).scalar()

    # Per-course completions
    course_stats = (
        db.query(
            CompletedExercise.course_id,
            func.count(CompletedExercise.id).label("completions"),
            func.sum(CompletedExercise.xp_earned).label("xp"),
        )
        .group_by(CompletedExercise.course_id)
        .all()
    )

    return {
        "users": total_users,
        "completions": total_completions,
        "total_xp": total_xp,
        "courses": [
            {"course_id": r.course_id, "completions": r.completions, "xp": r.xp}
            for r in course_stats
        ],
    }
