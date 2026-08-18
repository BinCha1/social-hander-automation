from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token, oauth2_scheme, verify_n8n_secret
from app.models.user import User


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise credentials_exception

    result = db.execute(select(User).where(User.username == payload["sub"]))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_request_actor(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> User | str | None:
    if verify_n8n_secret(request.headers.get("X-N8N-Webhook-Secret", "")):
        return "n8n"
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_access_token(auth[7:])
        if payload and "sub" in payload:
            user = db.execute(
                select(User).where(User.username == payload["sub"])
            ).scalar_one_or_none()
            if user:
                return user
    return None