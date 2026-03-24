import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

DATA_DIR = Path(__file__).parent.parent.parent / "data"


def load_exercises() -> list[dict]:
    with open(DATA_DIR / "exercises.json") as f:
        return json.load(f)["exercises"]


def load_materials() -> dict:
    with open(DATA_DIR / "exercises.json") as f:
        return json.load(f).get("materials", {})


@router.get("")
def list_exercises():
    return load_exercises()


@router.get("/{exercise_id}")
def get_exercise(exercise_id: int):
    exercises = load_exercises()
    exercise = next((e for e in exercises if e["id"] == exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    materials = load_materials()
    exercise["material"] = materials.get(str(exercise_id))
    return exercise
