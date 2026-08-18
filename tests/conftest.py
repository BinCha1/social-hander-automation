import os

os.environ["N8N_WEBHOOK_URL"] = ""
os.environ["N8N_SCHEDULE_WEBHOOK_URL"] = ""
os.environ["CLOUDINARY_CLOUD_NAME"] = ""
os.environ["CLOUDINARY_UPLOAD_PRESET"] = ""

import pytest
from sqlalchemy import text

from app.core.database import SessionLocal


@pytest.fixture(autouse=True)
def clean_users_before_each_test():
    with SessionLocal() as db:
        db.execute(text("TRUNCATE TABLE users, businesses, social_accounts, social_contents RESTART IDENTITY CASCADE"))
        db.commit()
    yield