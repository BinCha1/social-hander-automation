from datetime import datetime

from pydantic import BaseModel, Field, field_validator

SUPPORTED_PLATFORMS = ("facebook", "instagram", "linkedin", "threads")


class SocialAccountCreate(BaseModel):
    platform: str = Field(min_length=1, max_length=50)
    account_name: str = Field(min_length=1, max_length=255)
    account_id: str = Field(min_length=1, max_length=255)
    access_token: str = Field(min_length=1)
    refresh_token: str | None = None

    @field_validator("platform")
    @classmethod
    def validate_platform(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in SUPPORTED_PLATFORMS:
            raise ValueError(f"Unsupported platform. Must be one of {SUPPORTED_PLATFORMS}")
        return v


class SocialAccountUpdate(BaseModel):
    account_name: str | None = Field(default=None, max_length=255)
    account_id: str | None = Field(default=None, max_length=255)
    access_token: str | None = Field(default=None, min_length=1)
    refresh_token: str | None = None


class SocialAccountResponse(BaseModel):
    id: str
    user_id: str
    platform: str
    account_name: str
    account_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}