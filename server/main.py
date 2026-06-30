from fastapi import FastAPI
from dotenv import load_dotenv
import uvicorn
import src.database.user.models as models
from src.database.database import engine
from src.routes import auth, profile, blogs
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv() 

# Create tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth.router)
app.include_router(blogs.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serves files saved in UPLOAD_DIR at http://<host>/uploads/<filename>
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(profile.router)

@app.get("/")
def read_root():
    return {"message": "Server running"}


if __name__ == "__main__":
    uvicorn.run("main:app",host="0.0.0.0", port=8000, reload=True)

