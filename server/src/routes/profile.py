import os
from typing import Optional
import uuid

import aiofiles
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000") 
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB

# app = FastAPI(title="Photo Upload Service")
router = APIRouter(prefix="/profile", tags=["profile"])





@router.post("/upload")
async def upload_photo(file: UploadFile = File(...),
                       old_avatar_filename: Optional[str] = Form(None),):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        ext = "jpg"

    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    size = 0
    try:
        async with aiofiles.open(filepath, "wb") as out_file:
            while chunk := await file.read(CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="File too large (max 10MB)")
                await out_file.write(chunk)
    except HTTPException:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise
    except Exception:
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail="Failed to save file")
    
   # delete old avatar if exists
    if old_avatar_filename:
        old_path = os.path.join("uploads", str(old_avatar_filename))
        if os.path.isfile(old_path):
            os.remove(old_path)

    return {"url": f"{BASE_URL}/uploads/{filename}"}
