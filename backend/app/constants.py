"""Application-wide constants."""

ADMIN_EMAILS = {"r.kamun@gmail.com"}

EXERCISES_PER_COURSE = 23

COURSE_TITLES = {
    "general": "General Professional",
    "medical": "Healthcare",
    "education": "Education",
    "legal": "Legal",
    "psychotherapy": "Psychotherapy",
}

EVALUATION_SYSTEM_PROMPT = (
    'You are an expert prompt engineering coach. Score 1-5 stars. '
    'Respond ONLY in JSON, no fences:\n'
    '{"stars":3,"feedback":"...","strengths":["..."],"improvements":["..."],"tip":"..."}'
)
