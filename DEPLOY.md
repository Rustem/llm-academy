# Self-Hosted Deployment Guide

Deploy LLM Academy on your own server in minutes.

## Prerequisites

- Docker & Docker Compose
- An OpenRouter API key (free tier available at [openrouter.ai](https://openrouter.ai))

## Quick Start

```bash
git clone https://github.com/r-kamun/llm-academy.git
cd llm-academy
cp .env.example .env
# Edit .env with your API key and secret
docker compose up -d
```

The app will be available at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the project root:

```env
# Required
SECRET_KEY=your-random-secret-key-here
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional
DATABASE_URL=sqlite:///./llm_academy.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Generate a secure secret key:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │
│  (Nginx)     │     │  (FastAPI)  │
│  Port 3000   │     │  Port 8000  │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   SQLite    │
                    │  (Volume)   │
                    └─────────────┘
```

- **Frontend**: React app served by Nginx, proxies `/api` to backend
- **Backend**: FastAPI with SQLite, auto-creates tables on startup
- **Database**: SQLite file stored in a Docker volume (persists across restarts)

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | React app (Nginx) |
| backend | 8000 | FastAPI API server |

## Development Setup

Without Docker:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api` to `http://localhost:8000` via Vite config.

## Database

SQLite by default. Tables auto-created on startup. To reset:

```bash
# Docker
docker compose down -v
docker compose up -d

# Local
rm backend/llm_academy.db
# Restart backend
```

To use PostgreSQL instead, change `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/llm_academy
```
Then install `psycopg2-binary` in the backend.

## Updating

```bash
git pull
docker compose build
docker compose up -d
```

## Custom Courses

Add your own courses by creating JSON files in `backend/data/courses/`:

```json
{
  "course": {
    "id": "your-domain",
    "title": "Your Domain",
    "sub": "AI for your profession",
    "desc": "Description of your course.",
    "icon": "★",
    "color": "coral",
    "requiresAuth": true
  },
  "exercises": [ ... ],
  "materials": { ... }
}
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the exercise format and quality standards.

Validate your course: `python3 scripts/validate_exercises.py`

## API

The public API is available at `/api/v1/`:

```bash
# List courses
curl http://localhost:8000/api/v1/courses

# Get exercises
curl http://localhost:8000/api/v1/courses/general/exercises

# Get templates
curl http://localhost:8000/api/v1/templates

# API info
curl http://localhost:8000/api/v1/info
```

Full Swagger docs: `http://localhost:8000/docs`

## Monitoring

- Health check: `GET /api/health`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
