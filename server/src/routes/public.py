import re
import uuid
import asyncio
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/public", tags=["public"])


class BlogRequest(BaseModel):
    userId: int
    postId:int
    htmlPath: str  # e.g. "blog_files/fine-tuning-in-2026-ab12cd.html"
    image: str  # array of full-size image URLs

@router.post("/create")
async def create_blog(body: BlogRequest):
    if not body.userId or not body.postId or not body.htmlPath or not body.image:
        raise HTTPException(status_code=422, detail="id, path and image not be empty.")
    print(body.userId)
    print(body.postId)
    print(body.htmlPath)
    print(body.image)