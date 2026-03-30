"""LLM service: OpenRouter API calls + evaluation logic."""

import json

import httpx

from app.config import settings
from app.constants import EVALUATION_SYSTEM_PROMPT
from app.utils import clean_llm_json, to_list, safe_int

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def call_openrouter(
    model: str,
    messages: list[dict],
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> str:
    """Call OpenRouter API and return the response content."""
    headers = {
        "Content-Type": "application/json",
        "HTTP-Referer": "https://llm-academy.app",
        "X-Title": "LLM Academy",
    }
    if settings.OPENROUTER_API_KEY:
        headers["Authorization"] = f"Bearer {settings.OPENROUTER_API_KEY}"

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    model_short = model.split("/")[-1]

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(OPENROUTER_URL, json=payload, headers=headers)

        if resp.status_code == 429:
            raise Exception("Rate limited (429) — wait a moment and try again, or switch to a different model.")
        if resp.status_code == 503:
            raise Exception(f"Model '{model_short}' is temporarily unavailable (503) — try a different model.")
        if resp.status_code == 404:
            raise Exception(f"Model '{model_short}' not found (404) — it may have been removed from OpenRouter.")
        if resp.status_code == 402:
            raise Exception("Insufficient credits (402) — this model requires a funded OpenRouter account.")

        resp.raise_for_status()
        data = resp.json()

        if "error" in data:
            err_msg = data["error"].get("message", str(data["error"]))
            raise Exception(f"OpenRouter error: {err_msg}")

        choices = data.get("choices")
        if not choices or not choices[0].get("message"):
            raise Exception(f"Model '{model_short}' returned an empty response — try a different model.")

        content = choices[0]["message"].get("content")
        if not content:
            raise Exception(f"Model '{model_short}' returned no content — try a different model.")

        return content


def build_evaluation_prompt(exercise: dict, user_prompt: str, ai_response: str) -> tuple[str, str]:
    """Build the system + user messages for evaluation."""
    system_prompt = EVALUATION_SYSTEM_PROMPT
    user_message = (
        f"EXERCISE: {exercise['title']}\n"
        f"SCENARIO: {exercise['sc']}\n"
        f"TASK: {exercise['task']}\n"
        f"CRITERIA: {exercise['cr']}\n\n"
        f"USER PROMPT:\n{user_prompt}\n\n"
        f"AI RESPONSE:\n{ai_response}"
    )
    return system_prompt, user_message


def parse_evaluation_response(raw: str) -> dict:
    """Parse LLM evaluation JSON, handling malformed responses gracefully."""
    cleaned = clean_llm_json(raw)
    parsed = json.loads(cleaned)

    return {
        "stars": safe_int(parsed.get("stars", 3), default=3, min_val=1, max_val=5),
        "feedback": str(parsed.get("feedback", raw)),
        "strengths": to_list(parsed.get("strengths")),
        "improvements": to_list(parsed.get("improvements")),
        "tip": str(parsed.get("tip", "")),
    }
