import secrets
from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _gen_code():
    return secrets.token_hex(3).upper()


class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[str] = mapped_column(String, nullable=False, default="general")
    join_code: Mapped[str] = mapped_column(String, unique=True, nullable=False, default=_gen_code)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", foreign_keys=[teacher_id])
    members = relationship("ClassroomMember", back_populates="classroom", cascade="all, delete-orphan")
    assignments = relationship("ClassroomAssignment", back_populates="classroom", cascade="all, delete-orphan")
    custom_exercises = relationship("ClassroomExercise", back_populates="classroom", cascade="all, delete-orphan")


class ClassroomMember(Base):
    __tablename__ = "classroom_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    classroom_id: Mapped[int] = mapped_column(Integer, ForeignKey("classrooms.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="student")
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="members")
    user = relationship("User")


class ClassroomAssignment(Base):
    __tablename__ = "classroom_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    classroom_id: Mapped[int] = mapped_column(Integer, ForeignKey("classrooms.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, nullable=False)
    course_id: Mapped[str] = mapped_column(String, nullable=False, default="general")
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    due_date: Mapped[str | None] = mapped_column(String, nullable=True)

    classroom = relationship("Classroom", back_populates="assignments")


class ClassroomExercise(Base):
    __tablename__ = "classroom_exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    classroom_id: Mapped[int] = mapped_column(Integer, ForeignKey("classrooms.id"), nullable=False)
    teacher_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    scenario: Mapped[str] = mapped_column(Text, nullable=False)
    task: Mapped[str] = mapped_column(Text, nullable=False)
    hint: Mapped[str | None] = mapped_column(Text, nullable=True)
    criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String, nullable=False, default="Intermediate")
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="custom_exercises")
    teacher = relationship("User")
