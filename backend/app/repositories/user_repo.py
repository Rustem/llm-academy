from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import AbstractRepository


class UserRepository(AbstractRepository[User]):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, **filters) -> list[User]:
        query = self.db.query(User)
        for key, value in filters.items():
            if hasattr(User, key):
                query = query.filter(getattr(User, key) == value)
        return query.all()

    def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, id: int, **kwargs) -> Optional[User]:
        user = self.get_by_id(id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, id: int) -> bool:
        user = self.get_by_id(id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True
