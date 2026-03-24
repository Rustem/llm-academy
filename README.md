# LLM Academy

Interactive learning platform for AI prompt engineering. 23 hands-on exercises across 3 modules.

## Quick Start

```bash
# Backend
cd backend
cp ../.env.example .env    # add your OPENROUTER_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

Copy `.env.example` to `backend/.env` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Get free key at openrouter.ai/keys |
| `SECRET_KEY` | Yes | Random string for JWT signing |
| `DATABASE_URL` | No | Default: `sqlite:///./llm_academy.db` |
| `CORS_ORIGINS` | No | Default: `http://localhost:5173` |

## Project Structure

```
llm-academy/
  backend/          # Python/FastAPI
    app/
      routers/      # API endpoints (auth, llm, progress, exercises)
      services/     # Business logic (auth, llm proxy, progress)
      repositories/ # DB abstraction layer
      models/       # SQLAlchemy models
      schemas/      # Pydantic request/response schemas
    data/           # exercises.json
  frontend/         # React/Vite
    src/
      pages/        # Landing, Login, Register, Dashboard, Exercise, etc.
      components/   # NavBar, Btn, ExerciseCard, EvalResult, etc.
      services/     # API client (auth, llm, progress)
      constants/    # theme, exercises, models, modules, professions
      context/      # AuthContext
      hooks/        # useAuth, useProgress
```

## API

Backend runs at `http://localhost:8000`. Swagger docs at `/docs`.

| Endpoint | Auth | Purpose |
|----------|------|---------|
| POST /api/auth/register | No | Create account |
| POST /api/auth/login | No | Get JWT token |
| GET /api/auth/me | Yes | User profile + stats |
| POST /api/llm/chat | Yes | Proxy to LLM provider |
| POST /api/llm/evaluate | Yes | Evaluate user prompt |
| GET /api/progress | Yes | User's completed exercises |
| POST /api/progress/complete | Yes | Save exercise completion |
| GET /api/exercises | No | List all exercises |

## License

MIT
