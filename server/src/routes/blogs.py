from fastapi import APIRouter, HTTPException, Depends, File, Form, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.database.database import engine, get_db


router = APIRouter(prefix="/blogs", tags=["blogs"])


# -- create blog  ----

class UserResponse(BaseModel):
    topic: str
    

@router.post("/create")
async def create_blog(body: UserResponse):
     blog = body.topic
     print(blog)
     return blog