import re
import uuid
import asyncio
from pathlib import Path
from typing import List
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException,Depends
from src.database.database import engine, get_db
from pydantic import BaseModel
from src.database.public_blog.models import Blog
from sqlalchemy import select
import traceback
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
from sqlalchemy import select, desc
from src.database.user.models import User
from typing import Optional

router = APIRouter(prefix="/public", tags=["public"])


class BlogRequest(BaseModel):
    userId: int
    postId:int
    title: str 
    htmlPath: str  # e.g. "blog_files/fine-tuning-in-2026-ab12cd.html"
    image: str  # array of full-size image URLs




@router.post("/create")
async def create_blog(body: BlogRequest, db: Session = Depends(get_db)):
    if not body.userId or not body.postId or not body.htmlPath or not body.image:
        raise HTTPException(status_code=422, detail="id,title, htmlpath and image not be empty.")
    
    try:
        stmt = insert(Blog).values(
        user_id=body.userId,
        post_id=body.postId,
        title=body.title,
        html_path=body.htmlPath,
        image=body.image,
        ).on_conflict_do_update(
        index_elements=["user_id", "post_id"],
        set_={"image": body.image},
        ).returning(Blog)
        result = db.execute(stmt)
        db.commit()
        result.scalar_one()

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    

class BlogResponse(BaseModel):
    id: int
    user_id: int
    post_id:int
    title: str
    html_path:str
    image:str
    created_at: datetime

    class Config:
        from_attributes = True
    
@router.get("/blogs", response_model=List[BlogResponse])
def get_all_blogs(db: Session = Depends(get_db)):
    result = db.execute(
        select(Blog).order_by(desc(Blog.created_at))
    )
    blogs = result.scalars().all()
    return blogs


@router.get("/single/{blog_id}", response_model=BlogResponse)
def get_blog_by_id(blog_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        select(Blog).where(Blog.id == blog_id)
    )
    blog = result.scalar_one_or_none()

    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")

    return blog





class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# get user detels from blog table
@router.get("/user/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

