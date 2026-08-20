import json
from datetime import datetime, timezone
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import (
    decrypt_credential,
    encrypt_credential,
    verify_interaction_signature,
)
from app.dependencies import get_current_active_user, get_request_actor
from app.models.content import Content
from app.models.discord_config import DiscordConfig
from app.models.user import User
from app.schemas.discord import (
    ApprovalMessageCreate,
    DiscordConfigCreate,
    DiscordConfigResponse,
    DiscordConfigUpdate,
)

router = APIRouter(prefix="/discord", tags=["Discord Integration"])

_MAX_TIMESTAMP_AGE_SECONDS = 300
DISCORD_API_BASE = "https://discord.com/api/v10"


def _resolve_public_key(db: Session, application_id: str | None) -> str:
    if application_id:
        config = db.execute(
            select(DiscordConfig).where(
                DiscordConfig.application_id == application_id,
                DiscordConfig.is_active.is_(True),
            )
        ).scalar_one_or_none()
        if config and config.public_key:
            return config.public_key
    if get_settings().discord_public_key:
        return get_settings().discord_public_key
    return ""


def _resume_url_from(db: Session, content_id: str | None) -> str | None:
    if not content_id:
        return None
    content = db.execute(select(Content).where(Content.id == content_id)).scalar_one_or_none()
    if content and content.approval_resume_url:
        return content.approval_resume_url
    return None


async def _validate_discord_token(token: str) -> tuple[bool, str]:
    if not token:
        return False, "no token provided"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{DISCORD_API_BASE}/users/@me",
                headers={"Authorization": f"Bot {token}"},
            )
        if response.status_code == 200:
            return True, response.json().get("username") or "connected"
        return False, f"Discord rejected the token (HTTP {response.status_code})"
    except Exception as exc:
        return False, f"validation request failed: {exc}"


async def _fetch_bot_public_key(application_id: str, token: str) -> str | None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{DISCORD_API_BASE}/applications/{application_id}/bot",
                headers={"Authorization": f"Bot {token}"},
            )
        if response.status_code == 200:
            return response.json().get("public_key")
    except Exception:
        return None
    return None


async def _notify_n8n_approval(
    approved: bool, resume_url: str | None = None, **context
) -> bool:
    url = resume_url or get_settings().n8n_approval_webhook_url
    if not url:
        return False
    payload = {"approved": approved, **context}
    headers = {"Content-Type": "application/json"}
    if get_settings().n8n_webhook_secret:
        headers["X-N8N-Webhook-Secret"] = get_settings().n8n_webhook_secret
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return True
    except Exception:
        return False


@router.get("/config", response_model=DiscordConfigResponse)
def get_discord_config(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DiscordConfig:
    config = db.execute(
        select(DiscordConfig).where(DiscordConfig.user_id == current_user.id)
    ).scalar_one_or_none()
    if config is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discord config not found")
    return config


@router.post("/config", response_model=DiscordConfigResponse, status_code=status.HTTP_201_CREATED)
async def upsert_discord_config(
    payload: DiscordConfigCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DiscordConfig:
    config = db.execute(
        select(DiscordConfig).where(DiscordConfig.user_id == current_user.id)
    ).scalar_one_or_none()
    if config is None:
        config = DiscordConfig(user_id=current_user.id)
        db.add(config)
    config.encrypted_bot_token = encrypt_credential(payload.bot_token)
    if payload.application_id is not None:
        config.application_id = payload.application_id
    if payload.channel_id is not None:
        config.channel_id = payload.channel_id
    if payload.webhook_url is not None:
        config.webhook_url = payload.webhook_url
    ok, detail = await _validate_discord_token(payload.bot_token)
    config.connection_status = "connected" if ok else "error"
    config.last_error = None if ok else detail
    if ok:
        config.bot_name = detail
        if config.application_id and not config.public_key:
            key = await _fetch_bot_public_key(config.application_id, payload.bot_token)
            if key:
                config.public_key = key
    db.commit()
    db.refresh(config)
    return config


@router.put("/config", response_model=DiscordConfigResponse)
async def update_discord_config(
    payload: DiscordConfigUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DiscordConfig:
    config = db.execute(
        select(DiscordConfig).where(DiscordConfig.user_id == current_user.id)
    ).scalar_one_or_none()
    if config is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discord config not found")
    if payload.bot_token:
        config.encrypted_bot_token = encrypt_credential(payload.bot_token)
        ok, detail = await _validate_discord_token(payload.bot_token)
        config.connection_status = "connected" if ok else "error"
        config.last_error = None if ok else detail
        if ok:
            config.bot_name = detail
            if config.application_id and not config.public_key:
                key = await _fetch_bot_public_key(config.application_id, payload.bot_token)
                if key:
                    config.public_key = key
    if payload.application_id is not None:
        config.application_id = payload.application_id
    if payload.channel_id is not None:
        config.channel_id = payload.channel_id
    if payload.webhook_url is not None:
        config.webhook_url = payload.webhook_url
    if payload.is_active is not None:
        config.is_active = payload.is_active
    db.commit()
    db.refresh(config)
    return config


@router.delete("/config", status_code=status.HTTP_204_NO_CONTENT)
def delete_discord_config(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    config = db.execute(
        select(DiscordConfig).where(DiscordConfig.user_id == current_user.id)
    ).scalar_one_or_none()
    if config is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discord config not found")
    db.delete(config)
    db.commit()


@router.post("/approval-message", status_code=status.HTTP_200_OK)
async def send_approval_message(
    payload: ApprovalMessageCreate,
    actor: Annotated[User | str | None, Depends(get_request_actor)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    if actor is None or isinstance(actor, User):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    content = db.execute(
        select(Content).where(Content.id == payload.content_id)
    ).scalar_one_or_none()
    if content is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Content not found")
    config = db.execute(
        select(DiscordConfig).where(DiscordConfig.user_id == content.user_id)
    ).scalar_one_or_none()
    if config is None or not config.is_active:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Discord is not configured")
    if not config.channel_id:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Discord channel is not configured")

    media_url = (payload.media or {}).get("url") or ""
    media_type = (payload.media or {}).get("type") or "none"
    message = (
        "**CONTENT READY FOR PUBLICATION**\n\n"
        f"**Topic:** {payload.topic}\n\n"
        f"**Media:** {media_type}\n{media_url}\n\n"
        "The campaign contains Instagram, Facebook, LinkedIn and Threads content.\n\n"
        "Do you want to publish this campaign?"
    )
    components = [
        {
            "type": 1,
            "components": [
                {"type": 2, "style": 3, "label": "APPROVE ALL", "custom_id": f"approve_campaign:{content.id}"},
                {"type": 2, "style": 4, "label": "DECLINE ALL", "custom_id": f"decline_campaign:{content.id}"},
            ],
        }
    ]
    token = decrypt_credential(config.encrypted_bot_token)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{DISCORD_API_BASE}/channels/{config.channel_id}/messages",
                headers={"Authorization": f"Bot {token}", "Content-Type": "application/json"},
                json={"content": message, "components": components},
            )
        response.raise_for_status()
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Discord message failed: {exc}")
    return {"ok": True}


@router.post("/interactions")
async def discord_interactions(
    request: Request, db: Annotated[Session, Depends(get_db)]
):
    raw_body = await request.body()
    signature = request.headers.get("X-Signature-Ed25519", "")
    timestamp = request.headers.get("X-Signature-Timestamp", "")

    try:
        interaction = json.loads(raw_body)
    except ValueError:
        interaction = {}

    public_key = _resolve_public_key(db, interaction.get("application_id"))
    if not public_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, "Discord integration is not configured"
        )

    try:
        ts = int(timestamp)
        if abs(datetime.now(timezone.utc).timestamp() - ts) > _MAX_TIMESTAMP_AGE_SECONDS:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Interaction timestamp is too old")
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid timestamp")

    if not verify_interaction_signature(public_key, signature, timestamp, raw_body):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid signature")

    interaction_type = interaction.get("type")
    if interaction_type == 1:
        return {"type": 1}

    if interaction_type == 3:
        custom_id = (interaction.get("data") or {}).get("custom_id", "")
        approved = custom_id.startswith("approve_campaign")
        declined = custom_id.startswith("decline_campaign")

        if approved or declined:
            member = interaction.get("member") or {}
            content_id = None
            _, _, suffix = custom_id.partition(":")
            if suffix and not suffix.startswith("http"):
                content_id = suffix
            context = {
                "custom_id": custom_id,
                "content_id": content_id,
                "user_id": (member.get("user") or {}).get("id"),
                "channel_id": interaction.get("channel_id"),
                "guild_id": interaction.get("guild_id"),
            }
            resume_url = _resume_url_from(db, content_id)
            await _notify_n8n_approval(approved, resume_url=resume_url, **context)
            reply = (
                "Campaign approved - publishing now."
                if approved
                else "Campaign declined - nothing will be published."
            )
            return {"type": 4, "data": {"content": reply}}

        return {"type": 4, "data": {"content": "Unknown action"}}

    raise HTTPException(status.HTTP_400_BAD_REQUEST, "Unsupported interaction type")