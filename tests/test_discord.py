import json
import time
import unittest.mock

from fastapi.testclient import TestClient

from app.core.config import get_settings


def register_and_token(client, username: str) -> str:
    r = client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret-password"},
    )
    return r.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def sign_headers(discord_sign, body: bytes) -> dict:
    signature, timestamp = discord_sign(body)
    return {"X-Signature-Ed25519": signature, "X-Signature-Timestamp": timestamp}


class FakeResponse:
    status_code = 200

    def __init__(self, json_data=None):
        self._json = json_data or {}

    def json(self):
        return self._json

    def raise_for_status(self):
        return None


def patch_discord_http(monkeypatch, responses=None):
    mock_client = unittest.mock.AsyncMock()
    mock_client.post = unittest.mock.AsyncMock(side_effect=responses or [FakeResponse()])
    mock_client.get = unittest.mock.AsyncMock(return_value=FakeResponse({"username": "TestBot"}))
    mock_client.__aenter__.return_value = mock_client
    monkeypatch.setattr("app.routers.discord.httpx.AsyncClient", lambda **kw: mock_client)
    return mock_client


def test_ping_returns_pong(client, discord_sign):
    body = json.dumps({"type": 1, "application_id": "123"}).encode()
    r = client.post("/api/integrations/discord/interactions", content=body, headers=sign_headers(discord_sign, body))
    assert r.status_code == 200
    assert r.json() == {"type": 1}


def test_forged_signature_rejected(client, discord_sign):
    body = json.dumps({"type": 1, "application_id": "123"}).encode()
    signature, _ = discord_sign(body)
    r = client.post(
        "/api/integrations/discord/interactions",
        content=body,
        headers={"X-Signature-Ed25519": signature[::-1], "X-Signature-Timestamp": "0"},
    )
    assert r.status_code == 401


def test_stale_timestamp_rejected(client, discord_sign):
    body = json.dumps({"type": 1, "application_id": "123"}).encode()
    signature, _ = discord_sign(body)
    r = client.post(
        "/api/integrations/discord/interactions",
        content=body,
        headers={"X-Signature-Ed25519": signature, "X-Signature-Timestamp": str(int(time.time()) - 3600)},
    )
    assert r.status_code == 401


def test_config_save_validates_token_and_hides_it(client, monkeypatch, discord_sign):
    patch_discord_http(monkeypatch, [])
    token = register_and_token(client, "cfg_user")
    r = client.post(
        "/api/integrations/discord/config",
        json={"bot_token": "discord-bot-token-abc", "application_id": "app-1", "channel_id": "chan-1"},
        headers=auth(token),
    )
    assert r.status_code == 201
    body = r.json()
    assert "discord-bot-token-abc" not in str(body)
    assert body["bot_name"] == "TestBot"
    assert body["connection_status"] == "connected"


def test_config_save_bad_token_records_error(client, monkeypatch, discord_sign):
    mock_client = unittest.mock.AsyncMock()
    bad = FakeResponse()
    bad.status_code = 401
    mock_client.get = unittest.mock.AsyncMock(return_value=bad)
    mock_client.__aenter__.return_value = mock_client
    monkeypatch.setattr("app.routers.discord.httpx.AsyncClient", lambda **kw: mock_client)
    token = register_and_token(client, "badcfg_user")
    r = client.post(
        "/api/integrations/discord/config",
        json={"bot_token": "bad-token", "channel_id": "chan-1"},
        headers=auth(token),
    )
    assert r.status_code == 201
    assert r.json()["connection_status"] == "error"
    assert r.json()["last_error"]


def test_approval_message_sent_with_vaulted_token(client, monkeypatch, discord_sign, n8n_headers):
    mock_client = patch_discord_http(monkeypatch, [])
    token = register_and_token(client, "msg_user")
    client.post(
        "/api/integrations/discord/config",
        json={"bot_token": "discord-bot-token-abc", "application_id": "app-1", "channel_id": "chan-1"},
        headers=auth(token),
    )
    r = client.post(
        "/api/v1/content",
        json={"topic": "Launch", "platforms": ["linkedin"], "mode": "schedule"},
        headers=auth(token),
    )
    content_id = r.json()["id"]

    r = client.post(
        "/api/integrations/discord/approval-message",
        json={"content_id": content_id, "topic": "Launch", "media": {"type": "image", "url": "http://img/x.png"}},
        headers=n8n_headers,
    )
    assert r.status_code == 200
    assert mock_client.post.call_count == 1
    call = mock_client.post.call_args
    assert call.args[0] == "https://discord.com/api/v10/channels/chan-1/messages"
    assert call.kwargs["headers"]["Authorization"] == "Bot discord-bot-token-abc"
    buttons = call.kwargs["json"]["components"][0]["components"]
    assert buttons[0]["custom_id"] == f"approve_campaign:{content_id}"
    assert buttons[1]["custom_id"] == f"decline_campaign:{content_id}"


def test_approval_message_requires_engine_auth(client):
    token = register_and_token(client, "noauth_user")
    r = client.post(
        "/api/integrations/discord/approval-message",
        json={"content_id": "00000000-0000-0000-0000-000000000000", "topic": "X"},
        headers=auth(token),
    )
    assert r.status_code == 401


def test_approve_button_calls_resume_url(client, monkeypatch, discord_sign, n8n_headers):
    token = register_and_token(client, "approve_user")
    r = client.post(
        "/api/v1/content",
        json={"topic": "Approve me", "platforms": ["linkedin"], "mode": "schedule"},
        headers=auth(token),
    )
    content_id = r.json()["id"]
    resume_url = "http://resume.test/execution-1"

    r = client.put(
        f"/api/v1/content/{content_id}/approval-resume",
        json={"resume_url": resume_url},
        headers=n8n_headers,
    )
    assert r.status_code == 200

    body = json.dumps(
        {
            "type": 3,
            "application_id": "123",
            "channel_id": "123456",
            "guild_id": "654321",
            "data": {"custom_id": f"approve_campaign:{content_id}"},
            "member": {"user": {"id": "987"}},
        }
    ).encode()

    mock_client = patch_discord_http(monkeypatch, [])
    r = client.post("/api/integrations/discord/interactions", content=body, headers=sign_headers(discord_sign, body))
    assert r.status_code == 200
    assert r.json()["data"]["content"] == "Campaign approved - publishing now."
    assert mock_client.post.call_count == 1
    args, kwargs = mock_client.post.call_args
    assert args[0] == resume_url
    assert kwargs["json"]["approved"] is True
    assert kwargs["json"]["content_id"] == content_id


def test_decline_button_sends_false(client, monkeypatch, discord_sign, n8n_headers):
    token = register_and_token(client, "decline_user")
    r = client.post(
        "/api/v1/content",
        json={"topic": "Decline me", "platforms": ["instagram"], "mode": "schedule"},
        headers=auth(token),
    )
    content_id = r.json()["id"]
    resume_url = "http://resume.test/execution-2"
    client.put(
        f"/api/v1/content/{content_id}/approval-resume",
        json={"resume_url": resume_url},
        headers=n8n_headers,
    )

    body = json.dumps(
        {
            "type": 3,
            "application_id": "123",
            "data": {"custom_id": f"decline_campaign:{content_id}"},
        }
    ).encode()

    mock_client = patch_discord_http(monkeypatch, [])
    r = client.post("/api/integrations/discord/interactions", content=body, headers=sign_headers(discord_sign, body))
    assert r.status_code == 200
    assert r.json()["data"]["content"] == "Campaign declined - nothing will be published."
    _, kwargs = mock_client.post.call_args
    assert kwargs["json"]["approved"] is False


def test_fallback_to_approval_webhook_url(client, monkeypatch, discord_sign):
    fake_settings = get_settings()
    fake_settings.n8n_approval_webhook_url = "http://fallback.test/resume"
    monkeypatch.setattr("app.routers.discord.get_settings", lambda: fake_settings)
    mock_client = patch_discord_http(monkeypatch, [])
    body = json.dumps(
        {"type": 3, "application_id": "123", "data": {"custom_id": "approve_campaign"}}
    ).encode()
    r = client.post("/api/integrations/discord/interactions", content=body, headers=sign_headers(discord_sign, body))
    assert r.status_code == 200
    args, kwargs = mock_client.post.call_args
    assert args[0] == "http://fallback.test/resume"


def test_unconfigured_public_key_returns_503(client, monkeypatch, discord_sign):
    fake_settings = get_settings()
    fake_settings.discord_public_key = ""
    monkeypatch.setattr("app.routers.discord.get_settings", lambda: fake_settings)
    body = json.dumps({"type": 1, "application_id": "123"}).encode()
    r = client.post("/api/integrations/discord/interactions", content=body, headers=sign_headers(discord_sign, body))
    assert r.status_code == 503
