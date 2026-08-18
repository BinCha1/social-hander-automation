import os

os.environ["N8N_WEBHOOK_URL"] = ""
os.environ["N8N_SCHEDULE_WEBHOOK_URL"] = ""
os.environ["CLOUDINARY_CLOUD_NAME"] = ""
os.environ["CLOUDINARY_UPLOAD_PRESET"] = ""
os.environ["N8N_APPROVAL_WEBHOOK_URL"] = ""

import time

import pytest
from sqlalchemy import text

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from app.core.database import SessionLocal

_discord_private_key = Ed25519PrivateKey.generate()
os.environ["DISCORD_PUBLIC_KEY"] = _discord_private_key.public_key().public_bytes_raw().hex()


@pytest.fixture
def client():
    from app.core.config import get_settings
    get_settings.cache_clear()
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)


@pytest.fixture
def n8n_headers(client):
    from app.core.config import get_settings
    return {"X-N8N-Webhook-Secret": get_settings().n8n_webhook_secret}


@pytest.fixture
def discord_sign():
    def _sign(body: bytes) -> tuple[str, str]:
        timestamp = str(int(time.time()))
        signature = _discord_private_key.sign(timestamp.encode() + body).hex()
        return signature, timestamp
    return _sign


@pytest.fixture(autouse=True)
def clean_users_before_each_test():
    with SessionLocal() as db:
        db.execute(text("TRUNCATE TABLE users, businesses, social_accounts, social_contents, discord_configs RESTART IDENTITY CASCADE"))
        db.commit()
    yield
