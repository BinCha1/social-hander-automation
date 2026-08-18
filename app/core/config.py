from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Social Content Automation API"
    debug: bool = False

    database_url: str = ""
    secret_key: str = ""
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["*"]
    n8n_webhook_secret: str = ""
    n8n_webhook_url: str = ""
    n8n_schedule_webhook_url: str = ""
    n8n_approval_webhook_url: str = ""
    discord_public_key: str = ""
    cloudinary_cloud_name: str = ""
    cloudinary_upload_preset: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def _require_critical(self) -> "Settings":
        if not self.database_url:
            raise ValueError("DATABASE_URL must be set in .env")
        if not self.secret_key:
            raise ValueError("SECRET_KEY must be set in .env")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()