from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Social Content Automation API"
    debug: bool = False

    database_url: str = (
        "postgresql+psycopg://socialhandler:socialhandler@localhost:5432/socialhandler"
    )

    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()