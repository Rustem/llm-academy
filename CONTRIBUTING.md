# Contributing to LLM Academy

Thank you for your interest in contributing! This guide covers how to add exercises, courses, and templates to the platform.

## How to Contribute

1. **Fork** this repository
2. **Create a branch** for your changes (`feature/medical-exercises-batch-2`)
3. **Make your changes** following the guidelines below
4. **Run validation** to check your work
5. **Open a PR** using the PR template
6. **The primary author reviews and merges** all contributions

## Exercise Authoring Guidelines

### JSON Schema

Each exercise must include these fields:

```json
{
  "id": 1,
  "m": 1,
  "d": "Beginner",
  "title": "Short title (2-5 words)",
  "sc": "Scenario text (2-5 sentences)",
  "task": "Task description (1-3 sentences)",
  "hint": "Hint text (1-2 sentences)",
  "cr": "1) Criterion 2) Criterion 3) Criterion",
  "xp": 80
}
```

### Field Rules

| Field | Rules |
|-------|-------|
| `id` | Sequential integer (1-23 within a course) |
| `m` | Module number: 1 (Foundations), 2 (Techniques), 3 (Real Work) |
| `d` | Exactly one of: `"Beginner"`, `"Intermediate"`, `"Advanced"` |
| `title` | 2-5 words, action-oriented |
| `sc` | 2-5 sentences. Conversational, problem-first. Include specific details (names, numbers, conditions) |
| `task` | Start with "Write a prompt that..." — action-oriented, 1-3 sentences |
| `hint` | 1-2 sentences. Show good vs bad approach, or state a principle |
| `cr` | Numbered list format: `"1) ... 2) ... 3) ..."`. 4-7 items. No periods at end |
| `xp` | Must match the standard per exercise ID (see XP table below) |

### XP Values (must match across all courses)

| Exercise IDs | Difficulty | XP |
|---|---|---|
| 1-4 | Beginner | 80 |
| 5 | Beginner | 100 |
| 6 | Intermediate | 120 |
| 7 | Intermediate | 150 |
| 8-11 | Intermediate | 150 |
| 12-13 | Advanced | 200 |
| 14-15 | Advanced | 200 |
| 16-17 | Intermediate | 200 |
| 18 | Intermediate | 180 |
| 19 | Advanced | 250 |
| 20 | Advanced | 280 |
| 21 | Advanced | 250 |
| 22 | Advanced | 280 |
| 23 | Advanced (Capstone) | 350 |

### Technique Mapping

Each exercise ID teaches a specific technique — the same across all courses:

| ID | Technique | Module |
|----|-----------|--------|
| 1 | Precision / specificity | 1 |
| 2 | Output format specification | 1 |
| 3 | Audience and tone control | 1 |
| 4 | Setting constraints (positive + negative) | 1 |
| 5 | Role assignment | 1 |
| 6 | Iterative refinement | 1 |
| 7 | Planning / detailed specification | 1 |
| 8 | Chain-of-thought reasoning | 2 |
| 9 | Few-shot examples | 2 |
| 10 | Structured output | 2 |
| 11 | Compare and evaluate | 2 |
| 12 | Multi-step decomposition | 2 |
| 13 | Error correction | 2 |
| 14 | Persona / multi-perspective prompting | 2 |
| 15 | Reusable prompt templates | 2 |
| 16 | Domain-specific analysis | 3 |
| 17 | Triage / prioritization | 3 |
| 18 | Structured note-taking | 3 |
| 19 | Data comparison | 3 |
| 20 | Report drafting | 3 |
| 21 | Sensitive communications | 3 |
| 22 | Screening / evaluation | 3 |
| 23 | Capstone (combine 3+ techniques) | 3 |

### Quality Standards

Your exercises must meet these criteria:

**Scenarios**
- Use realistic, domain-specific details (real conditions, procedures, terminology)
- Include specific numbers, names, or constraints — never vague
- Present a real problem the professional would face

**Tasks**
- Be clear about what the user should produce
- Specify format expectations where relevant
- Reference the scenario's context

**Hints**
- Contrast good vs bad approaches, or state a principle
- Never give away the answer

**Criteria**
- Each criterion should be independently testable
- Mix input checks ("Specifies X"), output checks ("Defines Y"), and meta checks ("Demonstrates Z technique")
- Beginner: 4 criteria, Intermediate: 4-5, Advanced: 5-7

**Materials**
- Provide realistic sample data for exercises that need it
- Materials are keyed by exercise ID as strings: `"materials": {"1": "...", "2": "..."}`
- Use realistic but fictional data (names, numbers, dates)

### Course File Structure

Each course is a JSON file in `backend/data/courses/`:

```json
{
  "course": {
    "id": "domain-name",
    "title": "Display Title",
    "sub": "Short subtitle",
    "desc": "1-2 sentence description.",
    "icon": "emoji or symbol",
    "color": "coral|amber|blue|green|purple",
    "requiresAuth": true
  },
  "exercises": [ ... ],
  "materials": { ... }
}
```

## Validation

Before submitting, run the validation script:

```bash
python3 scripts/validate_exercises.py
```

This checks:
- Valid JSON structure
- All required fields present
- Correct XP values per exercise ID
- Module assignments match exercise IDs
- Difficulty values are valid
- 23 exercises per course
- Materials present for exercises that need them

## Pull Request Process

1. Use the PR template (`.github/pull_request_template.md`)
2. Ensure validation passes
3. Include a brief description of what scenarios you added/changed
4. The primary author ([@r-kamun](https://github.com/r-kamun)) reviews all exercise content
5. PRs are tested on the beta environment before merging

## Code of Conduct

- Keep exercises professional and respectful
- Use realistic but fictional data — never real patient/client information
- Medical, legal, and therapy exercises should be clinically/legally sound
- When in doubt, consult a domain expert
