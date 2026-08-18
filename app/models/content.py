import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Content(Base):
    __tablename__ = "social_contents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), index=True, nullable=False
    )
    business_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("businesses.id")
    )
    topic: Mapped[str] = mapped_column(String(500), nullable=False)
    platforms: Mapped[list] = mapped_column(JSON, nullable=False)
    goal: Mapped[str | None] = mapped_column(String(200))
    cta: Mapped[str | None] = mapped_column(String(500))
    user_prompt: Mapped[str | None] = mapped_column(Text)
    preferred_media: Mapped[str | None] = mapped_column(String(50), default="image")
    user_image_url: Mapped[str | None] = mapped_column(Text)
    user_video_url: Mapped[str | None] = mapped_column(Text)
    media_instructions: Mapped[str | None] = mapped_column(Text)
    mode: Mapped[str] = mapped_column(String(50), default="instant", nullable=False)
    publish_date: Mapped[str | None] = mapped_column(String(20))
    publish_time: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    feedback: Mapped[str | None] = mapped_column(Text)
    approval_resume_url: Mapped[str | None] = mapped_column(Text)
    n8n_status_code: Mapped[int | None] = mapped_column(Integer)
    n8n_response: Mapped[str | None] = mapped_column(Text)
    last_error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )