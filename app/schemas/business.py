from datetime import datetime

from pydantic import BaseModel, Field


class BusinessProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(default="General", max_length=255)
    about: str | None = None
    products: str | None = None
    website: str | None = None
    target_audience: str | None = None
    brand_tone: str | None = None
    industry: str | None = None
    brand_style: str | None = None


class BusinessProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: str | None = Field(default=None, max_length=255)
    about: str | None = None
    products: str | None = None
    website: str | None = None
    target_audience: str | None = None
    brand_tone: str | None = None
    industry: str | None = None
    brand_style: str | None = None


class BusinessProfileResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str | None = None
    about: str | None = None
    products: str | None = None
    website: str | None = None
    target_audience: str | None = None
    brand_tone: str | None = None
    industry: str | None = None
    brand_style: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}