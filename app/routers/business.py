from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_active_user
from app.models.business import Business
from app.models.user import User
from app.schemas.business import (
    BusinessProfileCreate,
    BusinessProfileResponse,
    BusinessProfileUpdate,
)

router = APIRouter(prefix="/business", tags=["Business Profile"])


def _get_or_404(db: Session, user_id: str) -> Business:
    result = db.execute(select(Business).where(Business.user_id == user_id))
    business = result.scalar_one_or_none()
    if business is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business profile not found")
    return business


@router.get("/profile", response_model=BusinessProfileResponse)
def get_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Business:
    return _get_or_404(db, current_user.id)


@router.post("/profile", response_model=BusinessProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: BusinessProfileCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Business:
    existing = db.execute(
        select(Business).where(Business.user_id == current_user.id)
    ).scalar_one_or_none()
    if existing:
        for field, value in payload.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    business = Business(user_id=current_user.id, **payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


@router.put("/profile", response_model=BusinessProfileResponse)
def update_profile(
    payload: BusinessProfileUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Business:
    business = _get_or_404(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    business = _get_or_404(db, current_user.id)
    db.delete(business)
    db.commit()