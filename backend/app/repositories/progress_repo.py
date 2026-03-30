from typing import Optional

from sqlalchemy.orm import Session

from app.models.progress import CompletedExercise
from app.repositories.base import AbstractRepository


class ProgressRepository(AbstractRepository[CompletedExercise]):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Optional[CompletedExercise]:
        return self.db.query(CompletedExercise).filter(CompletedExercise.id == id).first()

    def get_by_user_and_exercise(
        self, user_id: int, exercise_id: int, course_id: str = "general"
    ) -> Optional[CompletedExercise]:
        return (
            self.db.query(CompletedExercise)
            .filter(
                CompletedExercise.user_id == user_id,
                CompletedExercise.course_id == course_id,
                CompletedExercise.exercise_id == exercise_id,
            )
            .first()
        )

    def get_all(self, **filters) -> list[CompletedExercise]:
        query = self.db.query(CompletedExercise)
        for key, value in filters.items():
            if hasattr(CompletedExercise, key):
                query = query.filter(getattr(CompletedExercise, key) == value)
        return query.all()

    def get_all_for_user(self, user_id: int, course_id: str | None = None) -> list[CompletedExercise]:
        if course_id:
            return self.get_all(user_id=user_id, course_id=course_id)
        return self.get_all(user_id=user_id)

    def create(self, **kwargs) -> CompletedExercise:
        record = CompletedExercise(**kwargs)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def upsert(self, user_id: int, exercise_id: int, course_id: str = "general", **kwargs) -> CompletedExercise:
        existing = self.get_by_user_and_exercise(user_id, exercise_id, course_id)
        if existing:
            for key, value in kwargs.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        return self.create(user_id=user_id, exercise_id=exercise_id, course_id=course_id, **kwargs)

    def update(self, id: int, **kwargs) -> Optional[CompletedExercise]:
        record = self.get_by_id(id)
        if not record:
            return None
        for key, value in kwargs.items():
            if hasattr(record, key):
                setattr(record, key, value)
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete(self, id: int) -> bool:
        record = self.get_by_id(id)
        if not record:
            return False
        self.db.delete(record)
        self.db.commit()
        return True
