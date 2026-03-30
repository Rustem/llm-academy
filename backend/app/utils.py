"""Shared utility functions."""


def extract_username(email: str) -> str:
    """Extract username from email address."""
    return email.split("@")[0]


def clean_llm_json(raw: str) -> str:
    """Strip markdown code fences from LLM JSON responses."""
    return raw.replace("```json", "").replace("```", "").strip()


def to_list(val) -> list:
    """Coerce a value to a list. Wraps strings, passes lists through, returns [] for None."""
    if isinstance(val, list):
        return val
    if isinstance(val, str) and val:
        return [val]
    return []


def safe_int(val, default: int = 0, min_val: int | None = None, max_val: int | None = None) -> int:
    """Parse an int from a value, with optional clamping."""
    if isinstance(val, int):
        result = val
    elif isinstance(val, str):
        digits = "".join(c for c in val if c.isdigit())
        result = int(digits) if digits else default
    else:
        result = default
    if min_val is not None:
        result = max(min_val, result)
    if max_val is not None:
        result = min(max_val, result)
    return result
