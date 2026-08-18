from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import encrypt_credential
from app.dependencies import get_current_active_user
from app.models.social_account import SocialAccount
from app.models.user import User
from app.schemas.credentials import (
    SocialAccountCreate,
    SocialAccountResponse,
    SocialAccountUpdate,
)

router = APIRouter(prefix="/credentials", tags=["Social Credentials"])


def _get_or_404(db: Session, user_id: str, platform: str) -> SocialAccount:
    result = db.execute(
        select(SocialAccount).where(
            SocialAccount.user_id == user_id,
            SocialAccount.platform == platform,
        )
    )
    account = result.scalar_one_or_none()
    if account is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Credential not found")
    return account


@router.get("", response_model=list[SocialAccountResponse])
def list_credentials(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[SocialAccount]:
    result = db.execute(
        select(SocialAccount).where(SocialAccount.user_id == current_user.id)
    )
    return list(result.scalars())


@router.get("/{platform}", response_model=SocialAccountResponse)
def get_credential(
    platform: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SocialAccount:
    return _get_or_404(db, current_user.id, platform.strip().lower())


@router.post("", response_model=SocialAccountResponse, status_code=status.HTTP_201_CREATED)
def connect_credential(
    payload: SocialAccountCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SocialAccount:
    existing = db.execute(
        select(SocialAccount).where(
            SocialAccount.user_id == current_user.id,
            SocialAccount.platform == payload.platform,
        )
    ).scalar_one_or_none()
    if existing:
        existing.account_name = payload.account_name
        existing.account_id = payload.account_id
        existing.encrypted_access_token = encrypt_credential(payload.access_token)
        if payload.refresh_token:
            existing.encrypted_refresh_token = encrypt_credential(payload.refresh_token)
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing

    account = SocialAccount(
        user_id=current_user.id,
        platform=payload.platform,
        account_name=payload.account_name,
        account_id=payload.account_id,
        encrypted_access_token=encrypt_credential(payload.access_token),
        encrypted_refresh_token=(
            encrypt_credential(payload.refresh_token) if payload.refresh_token else None
        ),
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.put("/{platform}", response_model=SocialAccountResponse)
def update_credential(
    platform: str,
    payload: SocialAccountUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SocialAccount:
    account = _get_or_404(db, current_user.id, platform.strip().lower())
    data = payload.model_dump(exclude_unset=True)
    if "access_token" in data:
        account.encrypted_access_token = encrypt_credential(data.pop("access_token"))
    if "refresh_token" in data:
        if data["refresh_token"]:
            account.encrypted_refresh_token = encrypt_credential(data["refresh_token"])
        else:
            account.encrypted_refresh_token = None
        data.pop("refresh_token")
    for field, value in data.items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{platform}", status_code=status.HTTP_204_NO_CONTENT)
def disconnect_credential(
    platform: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    account = _get_or_404(db, current_user.id, platform.strip().lower())
    db.delete(account)
    db.commit()