import pytest
from sqlalchemy import text

from app.core.database import SessionLocal


@pytest.fixture(autouse=True)
def clean_users_before_each_test():
    with SessionLocal() as db:
        db.execute(text("TRUNCATE TABLE users"))
        db.commit()
    yield