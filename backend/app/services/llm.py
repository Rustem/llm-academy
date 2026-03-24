import httpx

from app.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def call_openrouter(
    model: str,
    messages: list[dict],
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> str:
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

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(OPENROUTER_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
