LEVELS = [
    (3000, "Prompt Architect"),
    (2000, "AI Strategist"),
    (1200, "Prompt Crafter"),
    (500, "AI Explorer"),
    (0, "Newcomer"),
]


def get_level(xp: int) -> str:
    for threshold, name in LEVELS:
        if xp >= threshold:
            return name
    return "Newcomer"


def calc_xp(base_xp: int, stars: int) -> int:
    if stars >= 4:
        return base_xp
    return int(base_xp * 0.7)
