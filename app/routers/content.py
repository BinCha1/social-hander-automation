import httpx
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decrypt_credential
from app.dependencies import get_current_active_user, get_request_actor
from app.models.business import Business
from app.models.content import Content
from app.models.social_account import SocialAccount
from app.models.user import User
from app.schemas.content import (
    ApprovalResumeUpdate,
    ContentAutomationResponse,
    ContentCreate,
    ContentResponse,
    ContentStatusUpdate,
    ContentUpdate,
)
from app.schemas.credentials import SUPPORTED_PLATFORMS

router = APIRouter(prefix="/content", tags=["Content Requests"])
settings = get_settings()


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


def _resolve_credentials(db: Session, user_id: str, platforms: list[str]) -> dict:
    credentials: dict = {}
    for platform in platforms:
        key = platform.strip().lower()
        if key not in SUPPORTED_PLATFORMS:
            continue
        account = db.execute(
            select(SocialAccount).where(
                SocialAccount.user_id == user_id,
                SocialAccount.platform == key,
            )
        ).scalar_one_or_none()
        if account is None:
            continue
        credentials[f"{key}_token"] = decrypt_credential(account.encrypted_access_token)
        credentials[f"{key}_account_id"] = account.account_id
    if settings.cloudinary_cloud_name:
        credentials["cloudinary_cloud_name"] = settings.cloudinary_cloud_name
    if settings.cloudinary_upload_preset:
        credentials["cloudinary_upload_preset"] = settings.cloudinary_upload_preset
    return credentials


def _build_media_block(content: Content) -> dict:
    media_instructions = content.media_instructions or ""
    if content.user_image_url and content.user_image_url.strip():
        return {"type": "image", "url": content.user_image_url.strip(), "source": "user",
                "generate": False, "prompt": None, "instructions": media_instructions}
    if content.user_video_url and content.user_video_url.strip():
        return {"type": "video", "url": content.user_video_url.strip(), "source": "user",
                "generate": False, "prompt": None, "instructions": media_instructions}
    if content.preferred_media in ("image", "video"):
        return {"type": content.preferred_media, "url": None, "source": "generated",
                "generate": True, "prompt": media_instructions or content.topic,
                "instructions": media_instructions}
    return {"type": "none", "url": None, "source": None, "generate": False,
            "prompt": None, "instructions": media_instructions}


def _build_payload(content: Content, business: Business | None, credentials: dict) -> dict:
    return {
        "hasRow": True,
        "mode": content.mode,
        "rowNumber": 1,
        "row_number": 1,
        "job": {
            "contentId": content.id,
            "businessId": business.id if business else "",
            "publishDate": content.publish_date or "",
            "publishTime": content.publish_time or "",
            "status": content.status,
        },
        "business": {
            "id": business.id if business else "",
            "name": business.name if business else "",
            "type": (business.type or "General") if business else "General",
            "about": (business.about or "") if business else "",
            "products": (business.products or "") if business else "",
            "website": (business.website or "") if business else "",
            "logo": "",
            "targetAudience": (business.target_audience or "") if business else "",
            "brandTone": (business.brand_tone or "Professional & Engaging") if business else "Professional & Engaging",
            "industry": (business.industry or "General") if business else "General",
            "brandStyle": (business.brand_style or "Professional") if business else "Professional",
        },
        "content": {
            "topic": content.topic,
            "platforms": content.platforms,
            "goal": content.goal or "Product Promotion",
            "cta": content.cta or "",
            "userPrompt": content.user_prompt or "",
            "feedback": content.feedback or "",
        },
        "media": _build_media_block(content),
        "credentials": credentials,
    }


def _automation_response(db: Session, content: Content) -> ContentAutomationResponse:
    base = ContentResponse.model_validate(content).model_dump()
    business = db.execute(
        select(Business).where(Business.user_id == content.user_id)
    ).scalar_one_or_none()
    if business is None:
        base["payload_error"] = "Business profile not found"
        return ContentAutomationResponse.model_validate(base)
    credentials = _resolve_credentials(db, content.user_id, content.platforms)
    base.update(_build_payload(content, business, credentials))
    return ContentAutomationResponse.model_validate(base)


def _trigger_webhook(db: Session, content: Content) -> Content:
    if not settings.n8n_webhook_url:
        return content
    business = db.execute(
        select(Business).where(Business.user_id == content.user_id)
    ).scalar_one_or_none()
    credentials = _resolve_credentials(db, content.user_id, content.platforms)
    payload = _build_payload(content, business, credentials)
    headers = {"Content-Type": "application/json"}
    if settings.n8n_webhook_secret:
        headers["X-N8N-Webhook-Secret"] = settings.n8n_webhook_secret
    try:
        response = httpx.post(
            settings.n8n_webhook_url, json=payload, headers=headers, timeout=30.0
        )
        content.n8n_status_code = response.status_code
        content.n8n_response = response.text[:4000]
        content.last_error = None
    except Exception as exc:
        content.status = "failed"
        content.last_error = f"n8n webhook execution failed: {exc}"
        db.commit()
        db.refresh(content)
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, content.last_error)
    db.commit()
    db.refresh(content)
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
    if content.mode == "instant":
        content = _trigger_webhook(db, content)
    return content


@router.get("", response_model=list[ContentResponse | ContentAutomationResponse])
def list_content(
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
    status_filter: str | None = Query(default=None, alias="status"),
    mode: str | None = None,
    limit: int = Query(default=50, ge=1, le=500),
) -> list:
    _ensure_actor(actor)
    query = select(Content)
    if isinstance(actor, User):
        query = query.where(Content.user_id == actor.id)
    if status_filter:
        query = query.where(Content.status == status_filter)
    if mode:
        query = query.where(Content.mode == mode)
    contents = list(db.execute(query.limit(limit)).scalars())
    if isinstance(actor, str):
        return [_automation_response(db, c) for c in contents]
    return contents


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