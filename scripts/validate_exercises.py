#!/usr/bin/env python3
"""Validate all course exercise files against quality standards."""

import json
import sys
from pathlib import Path

COURSES_DIR = Path(__file__).parent.parent / "backend" / "data" / "courses"

REQUIRED_FIELDS = {"id", "m", "d", "title", "sc", "task", "hint", "cr", "xp"}
VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}
VALID_COLORS = {"coral", "amber", "blue", "green", "purple"}

# Standard XP values per exercise ID (must be the same across all courses)
STANDARD_XP = {
    1: 80, 2: 80, 3: 80, 4: 80, 5: 100,
    6: 120, 7: 150,
    8: 150, 9: 150, 10: 150, 11: 150,
    12: 200, 13: 200, 14: 200, 15: 200,
    16: 200, 17: 200, 18: 180,
    19: 250, 20: 280, 21: 250, 22: 280, 23: 350,
}

# Module assignments per exercise ID
STANDARD_MODULES = {
    **{i: 1 for i in range(1, 8)},
    **{i: 2 for i in range(8, 16)},
    **{i: 3 for i in range(16, 24)},
}


def validate_course(path: Path) -> list[str]:
    """Validate a single course file. Returns list of error messages."""
    errors = []
    name = path.stem

    try:
        with open(path) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"{name}: Invalid JSON — {e}"]

    # Course metadata
    course = data.get("course", {})
    if not course.get("id"):
        errors.append(f"{name}: Missing course.id")
    if not course.get("title"):
        errors.append(f"{name}: Missing course.title")
    if course.get("color") and course["color"] not in VALID_COLORS:
        errors.append(f"{name}: Invalid color '{course['color']}' — must be one of {VALID_COLORS}")

    # Exercises
    exercises = data.get("exercises", [])
    if len(exercises) != 23:
        errors.append(f"{name}: Expected 23 exercises, got {len(exercises)}")

    seen_ids = set()
    for ex in exercises:
        eid = ex.get("id", "?")
        prefix = f"{name}/ex{eid}"

        # Required fields
        missing = REQUIRED_FIELDS - set(ex.keys())
        if missing:
            errors.append(f"{prefix}: Missing fields: {missing}")
            continue

        # Duplicate IDs
        if eid in seen_ids:
            errors.append(f"{prefix}: Duplicate exercise ID")
        seen_ids.add(eid)

        # Difficulty
        if ex["d"] not in VALID_DIFFICULTIES:
            errors.append(f"{prefix}: Invalid difficulty '{ex['d']}'")

        # XP
        if eid in STANDARD_XP and ex["xp"] != STANDARD_XP[eid]:
            errors.append(f"{prefix}: XP should be {STANDARD_XP[eid]}, got {ex['xp']}")

        # Module
        if eid in STANDARD_MODULES and ex["m"] != STANDARD_MODULES[eid]:
            errors.append(f"{prefix}: Module should be {STANDARD_MODULES[eid]}, got {ex['m']}")

        # Content quality checks
        if len(ex["title"]) < 5:
            errors.append(f"{prefix}: Title too short (need 5+ chars)")
        if len(ex["sc"]) < 50:
            errors.append(f"{prefix}: Scenario too short (need 50+ chars)")
        if len(ex["task"]) < 30:
            errors.append(f"{prefix}: Task too short (need 30+ chars)")
        if len(ex["hint"]) < 20:
            errors.append(f"{prefix}: Hint too short (need 20+ chars)")

        # Criteria format check
        cr = ex["cr"]
        cr_count = cr.count(") ")
        if cr_count < 3:
            errors.append(f"{prefix}: Criteria should have 4+ items (found ~{cr_count})")

    # Check all IDs 1-23 present
    expected_ids = set(range(1, 24))
    if seen_ids != expected_ids and len(exercises) == 23:
        missing_ids = expected_ids - seen_ids
        if missing_ids:
            errors.append(f"{name}: Missing exercise IDs: {missing_ids}")

    # Materials
    materials = data.get("materials", {})
    if len(materials) < 10:
        errors.append(f"{name}: Only {len(materials)} materials — most exercises should have materials")

    return errors


def main():
    all_errors = []
    course_files = sorted(COURSES_DIR.glob("*.json"))

    if not course_files:
        print(f"ERROR: No course files found in {COURSES_DIR}")
        sys.exit(1)

    print(f"Validating {len(course_files)} courses...\n")

    for path in course_files:
        errors = validate_course(path)
        status = "FAIL" if errors else "OK"
        with open(path) as f:
            data = json.load(f)
        ex_count = len(data.get("exercises", []))
        mat_count = len(data.get("materials", {}))
        print(f"  {path.stem:20s} {ex_count} exercises, {mat_count} materials — {status}")
        for err in errors:
            print(f"    ✗ {err}")
        all_errors.extend(errors)

    print()
    if all_errors:
        print(f"FAILED: {len(all_errors)} error(s) found")
        sys.exit(1)
    else:
        print("ALL PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
