from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from src.database.database import Base

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,unique=True, index=True)
    post_id = Column(Integer, index=True)
    html_path = Column(String(3000), index=True)
    image = Column(String(3000), index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())