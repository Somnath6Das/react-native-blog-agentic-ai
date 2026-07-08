from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogCreate(BaseModel):
    user_id: int
    post_id: int
    title: str
    html_path: str
    image: str

class BlogUpdate(BaseModel):
    user_id: Optional[int] = None
    post_id: Optional[int] = None
    title: Optional[str] = None
    html_path: Optional[str] = None
    image: Optional[str] = None

class BlogResponse(BaseModel):
    id: int
    user_id: int
    post_id: int
    title: str
    html_path: str
    image: str
    created_at: datetime

    class Config:
        from_attributes = True