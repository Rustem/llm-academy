# CLAUDE.md

## Architecture

Monorepo with two apps:
- **backend/** — Python/FastAPI, SQLite (SQLAlchemy), JWT auth
- **frontend/** — React 18, Vite, React Router

Frontend proxies `/api` requests to backend via Vite dev server config.

## Key Patterns

### Backend

- **Repository pattern** for DB access. Abstract base in `repositories/base.py`, SQLAlchemy implementations in `user_repo.py` and `progress_repo.py`. To swap DB: change `DATABASE_URL` and update implementations if needed.
- **Dependency injection** via FastAPI's `Depends()`. See `dependencies.py` for `get_current_user`, `get_user_repo`, `get_progress_repo`.
- **Auth**: bcrypt for password hashing (direct, not passlib), python-jose for JWT. Token in Authorization header.
- **LLM proxy**: `services/llm.py` calls OpenRouter with server-side API key via httpx. Never expose API keys to frontend.
- **Exercises** are static JSON in `data/exercises.json`, not in the DB.

### Frontend

- **No CSS framework** — all inline styles using theme constants from `constants/theme.js`.
- **Auth state** managed via React Context (`context/AuthContext.jsx`), consumed via `useAuth()` hook.
- **API calls** go through `services/api.js` which auto-attaches JWT and handles 401 redirects.
- **Progress state** via `useProgress()` hook which wraps the progress API.

## Coding Guidelines

- Keep backend routers thin — business logic goes in `services/`.
- DB queries go through repositories, never direct session access in routers.
- Frontend pages go in `pages/`, reusable UI in `components/`.
- Constants (theme, exercises, models, etc.) live in `constants/` — don't inline them.
- New API endpoints: add schema in `schemas/`, route in `routers/`, wire in `main.py`.
- Don't add passlib — use bcrypt directly (passlib has compatibility issues with bcrypt>=4.1).

## Running

```bash
# Backend: cd backend && uvicorn app.main:app --reload
# Frontend: cd frontend && npm run dev
```

## Database

SQLite by default. Tables auto-created on startup via `Base.metadata.create_all()`. Models: `User`, `CompletedExercise`.

## Verification

After making changes, verify the app works end-to-end using Playwright.

### 1. Start servers

```bash
cd backend && uvicorn app.main:app --reload &
cd frontend && npm run dev &
```

Wait for both to be ready: `curl -s http://localhost:8000/api/exercises | head -c 50` and `curl -s http://localhost:5173 | head -c 50`.

### 2. Run smoke tests

```bash
npx playwright test e2e/smoke.spec.mjs --reporter=line
```

Tests log in with test user `r.kamun@gmail.com` / `123456`, verify dashboard and exercise page load. Screenshots saved to `e2e/dashboard.png` and `e2e/exercise.png` — read them to visually confirm.

### 3. What to check

- Login redirects to `/dashboard` (or `/onboarding` if no profession set)
- Dashboard shows all 3 modules and 23 exercises
- Exercise page shows scenario, task, prompt input, model selector, and "Test my prompt" button
- If testing LLM flow: write a prompt, click "Test my prompt", verify AI response appears, then evaluate
