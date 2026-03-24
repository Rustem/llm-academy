from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_user_repo, get_progress_repo, get_current_user
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.repositories.progress_repo import ProgressRepository
from app.schemas.auth import RegisterReq, LoginReq, TokenOut, UserOut
from app.services.auth import hash_password, verify_password, create_access_token
from app.services.progress import get_level

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(
    req: RegisterReq,
    user_repo: UserRepository = Depends(get_user_repo),
):
    if user_repo.get_by_email(req.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = user_repo.create(
        email=req.email,
        hashed_password=hash_password(req.password),
        profession=req.profession,
    )
    token = create_access_token(user.id, user.email)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
def login(
    req: LoginReq,
    user_repo: UserRepository = Depends(get_user_repo),
):
    user = user_repo.get_by_email(req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.id, user.email)
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(
    current_user: User = Depends(get_current_user),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    completed = progress_repo.get_all_for_user(current_user.id)
    total_xp = sum(c.xp_earned for c in completed)
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        profession=current_user.profession,
        total_xp=total_xp,
        level=get_level(total_xp),
        completed_count=len(completed),
    )


@router.patch("/me", response_model=UserOut)
def update_profile(
    updates: dict,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repo),
    progress_repo: ProgressRepository = Depends(get_progress_repo),
):
    allowed = {"profession"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if filtered:
        user_repo.update(current_user.id, **filtered)
    completed = progress_repo.get_all_for_user(current_user.id)
    total_xp = sum(c.xp_earned for c in completed)
    user = user_repo.get_by_id(current_user.id)
    return UserOut(
        id=user.id,
        email=user.email,
        profession=user.profession,
        total_xp=total_xp,
        level=get_level(total_xp),
        completed_count=len(completed),
    )
