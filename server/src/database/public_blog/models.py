from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func
from src.database.database import Base
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column


class Blog(Base):
    __tablename__ = "blogs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)  # remove unique=True here
    post_id: Mapped[int] = mapped_column(Integer, index=True)
    html_path: Mapped[str] = mapped_column(String)
    image: Mapped[str] = mapped_column(String)

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_blogs_user_post"),
    )