from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CompletedExercise(Base):
    __tablename__ = "completed_exercises"
    __table_args__ = (
        UniqueConstraint("user_id", "exercise_id", name="uq_user_exercise"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False)
    prompt_used: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="completed_exercises")
