from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import settings
from app.database import engine, Base
from app.routers import auth, llm, progress, exercises, templates, leaderboard, profiles, classrooms, certificate, public_api, admin


def _run_migrations(engine):
    """Run SQLite schema migrations for missing columns/tables."""
    insp = inspect(engine)
    if "completed_exercises" not in insp.get_table_names():
        return
    columns = [c["name"] for c in insp.get_columns("completed_exercises")]
    with engine.begin() as conn:
        if "course_id" not in columns:
            conn.execute(text("ALTER TABLE completed_exercises ADD COLUMN course_id VARCHAR NOT NULL DEFAULT 'general'"))
        if "attempt_count" not in columns:
            conn.execute(text("ALTER TABLE completed_exercises ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations(engine)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="LLM Academy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(llm.router)
app.include_router(progress.router)
app.include_router(exercises.router)
app.include_router(templates.router)
app.include_router(leaderboard.router)
app.include_router(profiles.router)
app.include_router(classrooms.router)
app.include_router(certificate.router)
app.include_router(public_api.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
