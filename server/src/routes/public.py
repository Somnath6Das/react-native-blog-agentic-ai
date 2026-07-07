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


router = APIRouter(prefix="/public", tags=["public"])


class BlogRequest(BaseModel):
    userId: int
    postId:int
    htmlPath: str  # e.g. "blog_files/fine-tuning-in-2026-ab12cd.html"
    image: str  # array of full-size image URLs

@router.post("/create")
async def create_blog(body: BlogRequest, db: Session = Depends(get_db)):
    if not body.userId or not body.postId or not body.htmlPath or not body.image:
        raise HTTPException(status_code=422, detail="id, path and image not be empty.")
    
    result = db.execute(
         select(Blog).where(
            Blog.user_id == body.userId,
            Blog.post_id == body.postId,
        )
    )
    existing_blog = result.scalar_one_or_none()

    if not existing_blog:
        new_blog = Blog(
            user_id=body.userId,
            post_id=body.postId,
            html_path=body.htmlPath,
            image=body.image,
        )
        db.add(new_blog)
        db.commit()
        db.refresh(new_blog)
        return new_blog
    else:
        existing_blog.html_path = body.htmlPath # type: ignore
        existing_blog.image = body.image # type: ignore
        db.commit()
        db.refresh(existing_blog)
        return existing_blog
