from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ContentCreate(BaseModel):
    topic: str = Field(min_length=1, max_length=500)
    platforms: list[str] = Field(min_length=1)
    goal: str | None = Field(default="Product Promotion", max_length=200)
    cta: str | None = Field(default=None, max_length=500)
    user_prompt: str | None = Field(default=None, max_length=5000)
    preferred_media: Literal["image", "video", "none"] = "image"
    user_image_url: str | None = None
    user_video_url: str | None = None
    media_instructions: str | None = None
    mode: Literal["instant", "schedule"] = "instant"
    publish_date: str | None = None
    publish_time: str | None = None


class ContentUpdate(BaseModel):
    topic: str | None = Field(default=None, min_length=1, max_length=500)
    platforms: list[str] | None = Field(default=None, min_length=1)
    goal: str | None = Field(default=None, max_length=200)
    cta: str | None = Field(default=None, max_length=500)
    user_prompt: str | None = None
    preferred_media: Literal["image", "video", "none"] | None = None
    user_image_url: str | None = None
    user_video_url: str | None = None
    media_instructions: str | None = None
    mode: Literal["instant", "schedule"] | None = None
    publish_date: str | None = None
    publish_time: str | None = None


class ContentStatusUpdate(BaseModel):
    status: Literal["pending", "processing", "done", "failed"]


class ApprovalResumeUpdate(BaseModel):
    resume_url: str = Field(min_length=1)


class ContentResponse(BaseModel):
    id: str
    user_id: str
    business_id: str | None = None
    topic: str
    platforms: list
    goal: str | None = None
    cta: str | None = None
    user_prompt: str | None = None
    preferred_media: str | None = None
    user_image_url: str | None = None
    user_video_url: str | None = None
    media_instructions: str | None = None
    mode: str
    publish_date: str | None = None
    publish_time: str | None = None
    status: str
    feedback: str | None = None
    n8n_status_code: int | None = None
    n8n_response: str | None = None
    last_error: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContentAutomationResponse(ContentResponse):
    hasRow: bool | None = None
    rowNumber: int | None = None
    job: dict | None = None
    business: dict | None = None
    content: dict | None = None
    media: dict | None = None
    credentials: dict | None = None
    payload_error: str | None = None


class PaginatedContentResponse(BaseModel):
    items: list[ContentResponse | ContentAutomationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int