from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_active_user, get_request_actor
from app.models.business import Business
from app.models.content import Content
from app.models.user import User
from app.schemas.content import (
    ApprovalResumeUpdate,
    ContentCreate,
    ContentResponse,
    ContentStatusUpdate,
    ContentUpdate,
)

router = APIRouter(prefix="/content", tags=["Content Requests"])


def _ensure_actor(actor: User | str | None) -> User | str:
    if actor is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return actor


def _get_or_404(db: Session, actor: User | str, content_id: str) -> Content:
    query = select(Content).where(Content.id == content_id)
    if isinstance(actor, User):
        query = query.where(Content.user_id == actor.id)
    content = db.execute(query).scalar_one_or_none()
    if content is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content not found")
    return content


@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
def create_content(
    payload: ContentCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Content:
    business = db.execute(
        select(Business).where(Business.user_id == current_user.id)
    ).scalar_one_or_none()
    content = Content(
        user_id=current_user.id,
        business_id=business.id if business else None,
        **payload.model_dump(),
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.get("", response_model=list[ContentResponse])
def list_content(
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = Query(default=None, alias="status"),
    mode: str | None = None,
    limit: int = Query(default=50, ge=1, le=500),
) -> list[Content]:
    _ensure_actor(actor)
    query = select(Content)
    if isinstance(actor, User):
        query = query.where(Content.user_id == actor.id)
    if status_filter:
        query = query.where(Content.status == status_filter)
    if mode:
        query = query.where(Content.mode == mode)
    return list(db.execute(query.limit(limit)).scalars())


@router.get("/{content_id}", response_model=ContentResponse)
def get_content(
    content_id: str,
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
) -> Content:
    _ensure_actor(actor)
    return _get_or_404(db, actor, content_id)


@router.put("/{content_id}", response_model=ContentResponse)
def update_content(
    content_id: str,
    payload: ContentUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Content:
    content = _get_or_404(db, current_user, content_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    return content


@router.patch("/{content_id}", response_model=ContentResponse)
def update_content_status(
    content_id: str,
    payload: ContentStatusUpdate,
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
) -> Content:
    _ensure_actor(actor)
    content = _get_or_404(db, actor, content_id)
    content.status = payload.status
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    content = _get_or_404(db, current_user, content_id)
    db.delete(content)
    db.commit()


@router.put("/{content_id}/approval-resume", response_model=ContentResponse)
def register_approval_resume(
    content_id: str,
    payload: ApprovalResumeUpdate,
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
) -> Content:
    _ensure_actor(actor)
    content = _get_or_404(db, actor, content_id)
    content.approval_resume_url = payload.resume_url
    db.commit()
    db.refresh(content)
    return content