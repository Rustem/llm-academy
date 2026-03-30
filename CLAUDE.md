# CLAUDE.md

## Quick Context

Read these documents to understand the project before making changes:
- **`BRD.md`** — Full business requirements: all features, data model, API surface, architecture
- **`ROADMAP.md`** — Completed phases and any future work
- **`CONTRIBUTING.md`** — Exercise authoring standards, JSON schema, quality checklist
- **`COMMANDS.md`** — Dev commands for running, testing, screenshots, validation
- **`DEPLOY.md`** — Docker deployment and self-hosting guide

## Architecture

Monorepo with two apps:
- **backend/** — Python/FastAPI, SQLite (SQLAlchemy), JWT auth
- **frontend/** — React 18, Vite, React Router, react-i18next

Frontend proxies `/api` requests to backend via Vite dev server config.

### Backend Structure

```
backend/app/
  main.py              — App startup, CORS, router wiring, migrations
  config.py            — Settings from .env (SECRET_KEY, OPENROUTER_API_KEY, etc.)
  constants.py         — ADMIN_EMAILS, EXERCISES_PER_COURSE, EVALUATION_SYSTEM_PROMPT
  utils.py             — extract_username(), clean_llm_json(), to_list(), safe_int()
  database.py          — SQLAlchemy engine, session, Base
  dependencies.py      — get_current_user, get_user_repo, get_progress_repo

  models/              — SQLAlchemy models (User, CompletedExercise, ExerciseAttempt, Classroom*)
  schemas/             — Pydantic request/response models
  repositories/        — DB access layer (repository pattern)
  services/            — Business logic
    course_loader.py   — load_course(), list_all_courses(), get_exercise()
    llm.py             — call_openrouter(), build_evaluation_prompt(), parse_evaluation_response()
    progress.py        — get_level(), build_progress_response()
    certificate.py     — PDF generation
  routers/             — Thin HTTP handlers (auth, llm, progress, exercises, templates,
                         leaderboard, profiles, classrooms, certificate, public_api, admin)

backend/data/
  courses/             — One JSON file per course (general, medical, education, legal, psychotherapy)
  templates.json       — 19 prompt templates
```

### Frontend Structure

```
frontend/src/
  main.jsx             — Entry point, imports i18n
  App.jsx              — React Router routes
  i18n/                — i18next config + locale files (en, ru, es)

  pages/               — Route-level components
    LandingPage, LoginPage, RegisterPage, OnboardingPage,
    CoursesPage, DashboardPage, ExercisePage,
    LeaderboardPage, ProfilePage, ClassroomsPage,
    ClassroomDetailPage, AdminPage, PrivacyPage

  components/          — Reusable UI
    Card, SectionLabel, ErrorAlert, FormInput, Btn,
    NavBar, ExerciseCard, StarRating, EvalResult,
    ResponseSection, TemplatePanel, MaterialPanel,
    CourseRoute, ProtectedRoute, AdPlaceholder

  services/            — API call wrappers
    api.js             — apiFetch() with JWT auto-attach
    courses.js         — fetchExercises(), fetchExercise(), fetchTemplates()
    progress.js        — fetchProgress(), completeExercise(), fetchAttempts()
    classrooms.js      — fetchClassrooms(), createClassroom(), joinClassroom(), etc.
    llm.js             — testPrompt(), evaluatePrompt()
    auth.js            — login(), register(), getMe(), updateProfile()

  hooks/               — useAuth(), useProgress(courseId)
  constants/           — theme.js, courses.js, modules.js, models.js, professions.js
```

## Key Patterns

### Backend

- **Repository pattern** for DB access. Abstract base in `repositories/base.py`.
- **Dependency injection** via FastAPI's `Depends()`. See `dependencies.py`.
- **Service layer** — routers are thin; business logic in `services/`.
- **Course loader** — `services/course_loader.py` centralizes all JSON file access. Routers never load JSON directly.
- **Auth**: bcrypt for password hashing (not passlib), python-jose for JWT.
- **LLM proxy**: `services/llm.py` calls OpenRouter server-side. Never expose API keys to frontend.
- **Courses** are static JSON in `data/courses/*.json`, not in the DB.
- **Attempt history**: `ExerciseAttempt` model stores up to 10 attempts per exercise (rolling window). `CompletedExercise` holds the latest result.

### Frontend

- **No CSS framework** — inline styles using theme constants from `constants/theme.js`. Responsive CSS in `index.css`.
- **Reusable components** — `Card`, `SectionLabel`, `ErrorAlert`, `FormInput` used across pages.
- **Auth state** via React Context (`context/AuthContext.jsx`), consumed via `useAuth()` hook.
- **API calls** go through `services/api.js` which auto-attaches JWT. Anonymous requests (no token) don't redirect on 401.
- **Progress** via `useProgress(courseId)` hook — course-scoped.
- **i18n** via react-i18next — EN/RU/ES. Language switcher in NavBar. All UI strings in `i18n/locales/*.json`.
- **Markdown rendering** — AI responses rendered with `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize`.
- **Multi-course routing**: `/courses`, `/course/:courseId`, `/course/:courseId/exercise/:id`. General course is public; others require auth (via `CourseRoute` component).

## Coding Guidelines

- Keep backend routers thin — business logic goes in `services/`.
- Shared utilities go in `utils.py`, constants in `constants.py`.
- Course/exercise loading goes through `services/course_loader.py`, never import from routers.
- Use `extract_username()` from utils — never inline `email.split("@")[0]`.
- DB queries go through repositories, never direct session access in routers.
- Frontend pages go in `pages/`, reusable UI in `components/`.
- Constants (theme, courses, models) live in `constants/` — don't inline magic values.
- New API endpoints: add schema in `schemas/`, route in `routers/`, wire in `main.py`.
- New UI strings: add to all 3 locale files (`en.json`, `ru.json`, `es.json`).
- Don't add passlib — use bcrypt directly (passlib has compatibility issues with bcrypt>=4.1).

## Running

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

## Testing

```bash
# Exercise validation (all 5 courses × 23 exercises)
python3 scripts/validate_exercises.py

# Backend unit tests (39 P0 regression tests)
cd backend && pytest tests/ -v

# Frontend build check
cd frontend && npm run build

# E2E smoke tests
npx playwright test e2e/smoke.spec.mjs --reporter=line
```

Test user: `r.kamun@gmail.com` / `123456`

## Database

SQLite by default. 7 tables auto-created on startup. Migrations run in `main.py:_run_migrations()` for schema evolution.

Models: `User`, `CompletedExercise`, `ExerciseAttempt`, `Classroom`, `ClassroomMember`, `ClassroomAssignment`, `ClassroomExercise`.

## What to Check After Changes

- Login redirects to `/courses` (or `/onboarding` if no profession set)
- Courses page shows all 5 domain courses
- General course (`/course/general`) accessible without login
- Exercise flow: scenario → prompt → test → AI response (markdown rendered) → evaluate → score → attempt saved
- Attempt history shows on revisit; clicking re-uses prompt
- Dashboard shows latest score per exercise
- `python3 scripts/validate_exercises.py` passes
- `cd backend && pytest tests/ -v` — 39 tests pass
- `cd frontend && npm run build` — no errors
