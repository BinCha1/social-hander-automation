"""Discord bot configuration model (table: discord_configs)."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DiscordConfig(Base):
    __tablename__ = "discord_configs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), nullable=False, unique=True, index=True
    )
    encrypted_bot_token: Mapped[str] = mapped_column(Text, nullable=False)
    bot_name: Mapped[str | None] = mapped_column(String(255))
    public_key: Mapped[str | None] = mapped_column(Text)
    application_id: Mapped[str | None] = mapped_column(String(255), index=True)
    channel_id: Mapped[str | None] = mapped_column(Text)
    connection_status: Mapped[str] = mapped_column(
        String(50), default="connected", nullable=False
    )
    last_error: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )