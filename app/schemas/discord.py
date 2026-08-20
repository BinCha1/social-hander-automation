"""Pydantic schemas for the Discord integration configuration."""

from datetime import datetime

from pydantic import BaseModel, Field


class DiscordConfigCreate(BaseModel):
    bot_token: str = Field(..., min_length=1)
    application_id: str | None = None
    channel_id: str | None = None
    webhook_url: str = Field(..., min_length=1)


class DiscordConfigUpdate(BaseModel):
    bot_token: str | None = Field(default=None, min_length=1)
    application_id: str | None = None
    channel_id: str | None = None
    webhook_url: str | None = Field(default=None, min_length=1)
    is_active: bool | None = None


class DiscordConfigResponse(BaseModel):
    id: str
    user_id: str
    bot_name: str | None = None
    public_key: str | None = None
    application_id: str | None = None
    channel_id: str | None = None
    webhook_url: str
    connection_status: str
    last_error: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApprovalMessageCreate(BaseModel):
    content_id: str
    topic: str = ""
    media: dict = {}