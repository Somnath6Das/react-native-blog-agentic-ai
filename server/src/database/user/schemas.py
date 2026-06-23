from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    avatar_url: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str
    created_at: datetime

    class Config:
        from_attributes = True