from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./llm_academy.db"
    SECRET_KEY: str = "change-me-to-a-random-string"
    OPENROUTER_API_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
