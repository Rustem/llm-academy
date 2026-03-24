from pydantic import BaseModel, EmailStr


class RegisterReq(BaseModel):
    email: str
    password: str
    profession: str | None = None


class LoginReq(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    profession: str | None
    total_xp: int = 0
    level: str = "Newcomer"
    completed_count: int = 0

    model_config = {"from_attributes": True}
