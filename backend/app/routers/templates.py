import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/api/templates", tags=["templates"])

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "templates.json"


def _load_templates() -> list[dict]:
    with open(DATA_FILE) as f:
        return json.load(f)["templates"]


@router.get("")
def list_templates(course: str | None = None, technique: str | None = None):
    templates = _load_templates()
    if course:
        templates = [t for t in templates if course in t.get("courses", [])]
    if technique:
        templates = [t for t in templates if t.get("technique") == technique]
    return templates
