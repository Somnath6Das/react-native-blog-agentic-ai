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
    
    try:
        stmt = insert(Blog).values(
        user_id=body.userId,
        post_id=body.postId,
        html_path=body.htmlPath,
        image=body.image,
        ).on_conflict_do_update(
        index_elements=["user_id", "post_id"],
        set_={"html_path": body.htmlPath, "image": body.image},
        ).returning(Blog)

        result = db.execute(stmt)
        db.commit()
        result.scalar_one()

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))