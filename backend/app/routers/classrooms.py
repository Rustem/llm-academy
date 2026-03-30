from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.utils import extract_username
from app.models.user import User
from app.models.classroom import Classroom, ClassroomMember, ClassroomAssignment, ClassroomExercise
from app.models.progress import CompletedExercise
from app.services.progress import get_level

router = APIRouter(prefix="/api/classrooms", tags=["classrooms"])


# ── Schemas ────────────────────────────────────────────────────

class CreateClassroomReq(BaseModel):
    name: str
    description: str | None = None
    course_id: str = "general"

class JoinClassroomReq(BaseModel):
    join_code: str

class AssignExerciseReq(BaseModel):
    exercise_id: int
    course_id: str = "general"
    due_date: str | None = None

class CreateExerciseReq(BaseModel):
    title: str
    scenario: str
    task: str
    hint: str | None = None
    criteria: str | None = None
    difficulty: str = "Intermediate"
    xp: int = 100


# ── Helpers ────────────────────────────────────────────────────

def _get_classroom(db: Session, classroom_id: int) -> Classroom:
    c = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return c

def _require_teacher(classroom: Classroom, user: User):
    if classroom.teacher_id != user.id:
        raise HTTPException(status_code=403, detail="Only the teacher can do this")

def _is_member(db: Session, classroom_id: int, user_id: int) -> bool:
    return db.query(ClassroomMember).filter(
        ClassroomMember.classroom_id == classroom_id,
        ClassroomMember.user_id == user_id,
    ).first() is not None


# ── Classroom CRUD ─────────────────────────────────────────────

@router.post("")
def create_classroom(
    req: CreateClassroomReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = Classroom(
        name=req.name,
        description=req.description,
        teacher_id=current_user.id,
        course_id=req.course_id,
    )
    db.add(classroom)
    db.flush()
    # Teacher is also a member
    member = ClassroomMember(classroom_id=classroom.id, user_id=current_user.id, role="teacher")
    db.add(member)
    db.commit()
    db.refresh(classroom)
    return _serialize_classroom(classroom, db)


@router.get("")
def list_my_classrooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memberships = db.query(ClassroomMember).filter(ClassroomMember.user_id == current_user.id).all()
    classroom_ids = [m.classroom_id for m in memberships]
    classrooms = db.query(Classroom).filter(Classroom.id.in_(classroom_ids)).all() if classroom_ids else []
    return [_serialize_classroom(c, db) for c in classrooms]


@router.get("/{classroom_id}")
def get_classroom(
    classroom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    if not _is_member(db, classroom_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")
    return _serialize_classroom(classroom, db)


# ── Join ───────────────────────────────────────────────────────

@router.post("/join")
def join_classroom(
    req: JoinClassroomReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = db.query(Classroom).filter(Classroom.join_code == req.join_code.upper()).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Invalid join code")
    if _is_member(db, classroom.id, current_user.id):
        return _serialize_classroom(classroom, db)
    member = ClassroomMember(classroom_id=classroom.id, user_id=current_user.id, role="student")
    db.add(member)
    db.commit()
    return _serialize_classroom(classroom, db)


# ── Assignments ────────────────────────────────────────────────

@router.post("/{classroom_id}/assignments")
def assign_exercise(
    classroom_id: int,
    req: AssignExerciseReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    _require_teacher(classroom, current_user)
    assignment = ClassroomAssignment(
        classroom_id=classroom_id,
        exercise_id=req.exercise_id,
        course_id=req.course_id,
        due_date=req.due_date,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"id": assignment.id, "exercise_id": assignment.exercise_id, "course_id": assignment.course_id, "due_date": assignment.due_date}


@router.get("/{classroom_id}/assignments")
def list_assignments(
    classroom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    if not _is_member(db, classroom_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")
    return [
        {"id": a.id, "exercise_id": a.exercise_id, "course_id": a.course_id, "due_date": a.due_date, "assigned_at": a.assigned_at.isoformat()}
        for a in classroom.assignments
    ]


# ── Student Progress (teacher view) ───────────────────────────

@router.get("/{classroom_id}/progress")
def get_classroom_progress(
    classroom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    if not _is_member(db, classroom_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")

    students = [m for m in classroom.members if m.role == "student"]
    assignment_ids = [(a.course_id, a.exercise_id) for a in classroom.assignments]

    result = []
    for student in students:
        completed = db.query(CompletedExercise).filter(CompletedExercise.user_id == student.user_id).all()
        total_xp = sum(c.xp_earned for c in completed)
        assigned_done = sum(
            1 for c in completed
            if (c.course_id, c.exercise_id) in assignment_ids
        ) if assignment_ids else 0

        result.append({
            "user_id": student.user_id,
            "username": extract_username(student.user.email),
            "total_xp": total_xp,
            "level": get_level(total_xp),
            "exercises_completed": len(completed),
            "assignments_completed": assigned_done,
            "assignments_total": len(assignment_ids),
        })

    return {
        "classroom": classroom.name,
        "student_count": len(students),
        "assignment_count": len(assignment_ids),
        "students": sorted(result, key=lambda x: x["total_xp"], reverse=True),
    }


# ── Custom Exercises ───────────────────────────────────────────

@router.post("/{classroom_id}/exercises")
def create_custom_exercise(
    classroom_id: int,
    req: CreateExerciseReq,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    _require_teacher(classroom, current_user)
    exercise = ClassroomExercise(
        classroom_id=classroom_id,
        teacher_id=current_user.id,
        title=req.title,
        scenario=req.scenario,
        task=req.task,
        hint=req.hint,
        criteria=req.criteria,
        difficulty=req.difficulty,
        xp=req.xp,
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return _serialize_custom_exercise(exercise)


@router.get("/{classroom_id}/exercises")
def list_custom_exercises(
    classroom_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    classroom = _get_classroom(db, classroom_id)
    if not _is_member(db, classroom_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member")
    return [_serialize_custom_exercise(e) for e in classroom.custom_exercises]


# ── Serializers ────────────────────────────────────────────────

def _serialize_classroom(c: Classroom, db: Session) -> dict:
    member_count = db.query(ClassroomMember).filter(ClassroomMember.classroom_id == c.id, ClassroomMember.role == "student").count()
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "teacher_id": c.teacher_id,
        "teacher_name": extract_username(c.teacher.email) if c.teacher else None,
        "course_id": c.course_id,
        "join_code": c.join_code,
        "student_count": member_count,
        "assignment_count": len(c.assignments),
        "custom_exercise_count": len(c.custom_exercises),
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }

def _serialize_custom_exercise(e: ClassroomExercise) -> dict:
    return {
        "id": e.id,
        "title": e.title,
        "scenario": e.scenario,
        "task": e.task,
        "hint": e.hint,
        "criteria": e.criteria,
        "difficulty": e.difficulty,
        "xp": e.xp,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }
