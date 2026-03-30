# Business Requirements Document — LLM Academy

**Version:** 1.0
**Date:** March 30, 2026
**Author:** Rustem Kamun

---

## 1. Executive Summary

LLM Academy is a hands-on prompt engineering learning platform for knowledge workers. Unlike theory-heavy courses, users learn by writing real prompts against real AI models and receiving instant AI-powered feedback. The platform serves five professional domains (general business, healthcare, education, legal, psychotherapy) with 115 exercises, multi-language support, and a gamified progression system.

---

## 2. Target Users

| Segment | Description | Primary Course |
|---------|-------------|----------------|
| General professionals | Managers, consultants, marketers, HR, finance | General Professional |
| Healthcare workers | Doctors, nurses, clinical administrators | Healthcare |
| Educators | K-12 teachers, higher-ed faculty, instructional designers | Education |
| Legal professionals | Attorneys, paralegals, compliance officers | Legal |
| Mental health professionals | Therapists, counselors, clinical psychologists | Psychotherapy |

**Key persona**: Non-technical professional who uses AI tools daily but hasn't learned structured prompting techniques.

---

## 3. Feature Inventory

### 3.1 Core Learning Platform

- **5 domain-specific courses**, each with 23 exercises (115 total)
- **3 progressive modules** per course: Foundations → Techniques → Real Work
- **Exercise flow**: Read scenario → Write prompt → Test against real AI → Get AI-scored evaluation
- **Difficulty levels**: Beginner (exercises 1-5), Intermediate (6-11), Advanced (12-23)
- **Supporting materials**: Realistic sample documents (contracts, lab results, transcripts) per exercise
- **General course freely accessible** without registration

### 3.2 Prompt Techniques Taught

Each exercise slot teaches a specific technique — consistent across all 5 courses:

| Slot | Technique | Module |
|------|-----------|--------|
| 1-4 | Precision, output format, audience/tone, constraints | Foundations |
| 5-7 | Role assignment, iterative refinement, planning | Foundations |
| 8-11 | Chain-of-thought, few-shot, structured output, compare/evaluate | Techniques |
| 12-15 | Decomposition, error correction, persona prompting, templates | Techniques |
| 16-23 | Domain analysis, triage, notes, data comparison, reports, comms, screening, capstone | Real Work |

### 3.3 Prompt Templates Library

- **19 reusable templates** (11 universal + 2 per domain)
- Filterable by course and technique type
- Integrated into exercise page — click to insert into prompt textarea
- Categories: chain-of-thought, few-shot, structured output, role assignment, constraints, refinement, planning, evaluation, decomposition, persona, SOAP notes, lesson plans, contract analysis, treatment plans, cognitive distortions

### 3.4 Multi-Model LLM Support

- **6 free models**: Llama 3.3 70B, Llama 3.2 3B, Nemotron 120B, Gemma 3 27B, Qwen3 Coder, Hermes 3 405B
- **5 premium models**: Claude Sonnet 4, GPT-4o Mini, GPT-4.1 Nano, Gemini 2.5 Flash, DeepSeek V3
- Model selector grouped by Free/Premium in exercise UI
- Server-side API key management via OpenRouter (never exposed to frontend)
- Graceful error handling with user-friendly messages (rate limits, unavailable models)

### 3.5 AI-Powered Evaluation

- Automated scoring: 1-5 stars
- Structured feedback: strengths, improvements, pro tip
- Handles malformed LLM responses (strings instead of arrays, stars as text, JSON wrapped in code fences)
- XP calculation: 4+ stars = full XP, 3 stars = 70% XP

### 3.6 Exercise Attempts & History

- Every evaluation (stars >= 3) creates an attempt record
- **Latest attempt = active score** on dashboard
- **Max 10 attempts stored** per exercise (rolling window — oldest deleted on 11th)
- Attempt history panel: attempt number, stars, model, timestamp, prompt preview
- **Click to re-use**: selecting a past attempt fills the prompt textarea

### 3.7 Progress & Gamification

- Per-course progress tracking (X/23 exercises completed)
- XP accumulation per course
- Level system: Newcomer → AI Explorer (500) → Prompt Crafter (1200) → AI Strategist (2000) → Prompt Architect (3000)
- Module unlock gates (complete N exercises to unlock next module)
- Star ratings visible on exercise cards

### 3.8 User Authentication & Profiles

- Email/password registration with bcrypt hashing
- JWT token-based stateless auth (7-day expiry)
- Profession selection during onboarding (maps to recommended course)
- **Public user profiles**: username, profession, level, XP, exercises completed, per-course breakdown, member-since date
- Accessible at `/profile/:username` without auth

### 3.9 Leaderboard

- Global ranking by total XP (top 20)
- Displays: rank, medal (gold/silver/bronze for top 3), username, profession, level, exercise count, XP
- Clickable usernames → profile page
- Public, no auth required

### 3.10 Prompt Sharing

- "Share prompt" button on evaluation results
- Copies formatted markdown to clipboard: exercise title, stars, prompt text
- Backend endpoint for user's saved prompts (`GET /api/progress/prompts`)

### 3.11 Certificate of Completion

- PDF generation (landscape A4, dark theme matching app)
- Requires all 23 exercises completed in a course
- Shows: username, course title, exercises completed, XP, level, issue date
- Download as `llm-academy-{course}-certificate.pdf`

### 3.12 Internationalization

- **3 languages**: English, Russian, Spanish
- Language switcher in navigation bar
- 100+ translated UI strings
- Browser language detection with localStorage persistence
- Exercise content remains in English (course JSON not translated)

### 3.13 Public API

- Read-only REST API at `/api/v1/`
- No authentication required
- Endpoints: info, courses, exercises, templates
- Use case: LMS integration, third-party embedding, content syndication

### 3.14 Admin Dashboard

- Platform stats: total users, completions, XP, per-course breakdown
- OpenRouter API usage: daily/weekly/monthly spend, free tier status, credit limits
- Available models table: name, context window, max output, pricing per 1M tokens, tier badge
- Admin access restricted by email whitelist

### 3.15 Mobile Responsiveness

- CSS breakpoints at 768px and 480px
- Exercise page: 2-column → single-column stack on mobile
- Course cards: grid → single column on mobile
- All pages verified on iPhone 13 viewport

---

## 4. Data Model

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User accounts | email, hashed_password, profession, created_at |
| **completed_exercises** | Active/latest result per exercise | user_id, course_id, exercise_id, stars, xp_earned, prompt_used, attempt_count |
| **exercise_attempts** | Full attempt history (max 10 per exercise) | user_id, course_id, exercise_id, attempt_number, stars, prompt_used, ai_response, model_used |

Static content (courses, exercises, materials, templates) stored as JSON files in `backend/data/`.

---

## 5. API Surface

### Internal API (30+ endpoints)

| Area | Endpoints | Auth |
|------|-----------|------|
| Auth | register, login, me, update profile | Mixed |
| Courses | list courses, list/get exercises | Public |
| LLM | chat, evaluate | Required |
| Progress | get progress, complete exercise, get attempts, get prompts | Required |
| Leaderboard | get leaderboard | Public |
| Profiles | get user profile | Public |
| Templates | list templates (filterable) | Public |
| Certificate | download PDF | Required |
| Admin | platform stats, OpenRouter usage | Admin only |

### Public API v1

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/info` | API metadata and endpoint listing |
| `GET /api/v1/courses` | All courses with exercise counts |
| `GET /api/v1/courses/{id}` | Course details + exercise titles |
| `GET /api/v1/courses/{id}/exercises` | Full exercise content |
| `GET /api/v1/courses/{id}/exercises/{eid}` | Single exercise with materials |
| `GET /api/v1/templates` | Prompt templates (filter: `?course=X&technique=Y`) |

---

## 6. Technical Architecture

```
┌──────────────────────────────┐
│     Frontend (React 18)      │
│  Vite · React Router · i18n  │
│  react-markdown · Playwright │
├──────────────────────────────┤
│         Nginx (prod)         │
│     /api → backend proxy     │
├──────────────────────────────┤
│    Backend (FastAPI/Python)   │
│  SQLAlchemy · JWT · httpx    │
│  reportlab · Pydantic        │
├──────────────────────────────┤
│   SQLite (auto-created)      │
│   JSON course data files     │
├──────────────────────────────┤
│   OpenRouter API (external)  │
│   11+ LLM models             │
└──────────────────────────────┘
```

**Key patterns**: Repository pattern, dependency injection, server-side LLM proxy, static course data (not in DB), JWT stateless auth.

---

## 7. Deployment Options

| Method | Description |
|--------|-------------|
| **Local dev** | `uvicorn` + `vite dev` with proxy |
| **Docker Compose** | 2 containers (backend + frontend/nginx), persistent volume |
| **Self-hosted** | See `DEPLOY.md` for full guide |

Environment variables: `SECRET_KEY`, `OPENROUTER_API_KEY`, `DATABASE_URL`, `CORS_ORIGINS`

---

## 8. Quality Assurance

| Layer | Tool | What it checks |
|-------|------|----------------|
| Exercise validation | `scripts/validate_exercises.py` | JSON schema, XP consistency, required fields, 23 per course |
| Backend unit tests | pytest (39 tests) | Evaluation parsing, course loading, API endpoints, auth guards |
| Frontend build | Vite | Compile errors, import resolution |
| E2E smoke tests | Playwright | Page rendering, login flow, exercise flow |
| CI/CD | GitHub Actions | All of the above on every PR and push to main |

---

## 9. Contributor Ecosystem

- `CONTRIBUTING.md`: Exercise authoring guidelines, JSON schema, quality standards, technique mapping
- `scripts/validate_exercises.py`: Automated validation (runs in CI)
- `.github/pull_request_template.md`: PR checklist for contributors
- `.github/workflows/validate.yml`: CI pipeline (validate + build + test + Docker)
- Fork & PR workflow: primary author reviews all contributions

---

## 10. Roadmap Status

| Phase | Status |
|-------|--------|
| 1. Content & Polish (6 items) | Complete |
| 2. UI Internationalization (3 items) | Complete |
| 3. Social & Engagement (3 items) | Complete |
| 4. Content Internationalization (6 items) | Planned |
| 5. Contributor Ecosystem (4 items) | Complete |
| 6. Platform Growth (5 items) | Complete |

---

## 11. Metrics & KPIs

| Metric | Current | Source |
|--------|---------|--------|
| Total exercises | 115 | 5 courses × 23 |
| Prompt templates | 19 | backend/data/templates.json |
| Supported languages | 3 | EN, RU, ES |
| LLM models available | 11 | 6 free + 5 premium |
| API endpoints | 30+ | Internal + Public v1 |
| Backend test coverage | 39 tests | pytest |
| Max attempts per exercise | 10 | Rolling window |
