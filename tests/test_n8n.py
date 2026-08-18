import unittest.mock

from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app

client = TestClient(app)
N8N_HEADERS = {"X-N8N-Webhook-Secret": get_settings().n8n_webhook_secret}


def register_and_token(username: str) -> str:
    r = client.post(
        "/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret-password"},
    )
    return r.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def create_business(token: str):
    client.post(
        "/business/profile",
        json={"name": "Acme Agency", "brand_tone": "Playful", "industry": "Marketing", "about": "We build brands"},
        headers=auth(token),
    )


def connect_credential(token: str, platform: str, account_id: str, token_value: str):
    client.post(
        "/credentials",
        json={"platform": platform, "account_name": platform, "account_id": account_id, "access_token": token_value},
        headers=auth(token),
    )


def test_automation_fetch_returns_payload():
    token = register_and_token("n8n_user")
    h = auth(token)
    create_business(token)
    connect_credential(token, "facebook", "123", "EAAB-secret")

    r = client.post(
        "/content",
        json={"topic": "Launch", "platforms": ["facebook"], "mode": "schedule"},
        headers=h,
    )
    cid = r.json()["id"]

    r = client.get("/content?status=pending&mode=schedule&limit=1", headers=N8N_HEADERS)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    row = rows[0]
    assert row["job"]["contentId"] == cid
    assert row["business"]["name"] == "Acme Agency"
    assert row["business"]["brandTone"] == "Playful"
    assert row["content"]["topic"] == "Launch"
    assert row["credentials"]["facebook_token"] == "EAAB-secret"
    assert row["credentials"]["facebook_account_id"] == "123"
    assert row["payload_error"] is None


def test_instant_dispatch_fires_webhook(monkeypatch):
    token = register_and_token("dispatch_user")
    h = auth(token)
    create_business(token)

    mock_post = unittest.mock.Mock()
    mock_post.return_value.status_code = 200
    mock_post.return_value.text = "ok"

    monkeypatch.setattr("app.routers.content.settings.n8n_webhook_url", "http://fake-webhook.test")
    with unittest.mock.patch("app.routers.content.httpx.post", mock_post):
        r = client.post(
            "/content",
            json={"topic": "Go live", "platforms": ["instagram"], "mode": "instant"},
            headers=h,
        )

    assert r.status_code == 201
    assert mock_post.call_count == 1
    args, kwargs = mock_post.call_args
    assert args[0] == "http://fake-webhook.test"
    assert kwargs["headers"]["X-N8N-Webhook-Secret"] == get_settings().n8n_webhook_secret
    assert kwargs["json"]["job"]["contentId"] == r.json()["id"]
    assert r.json()["n8n_status_code"] == 200


def test_automation_fetch_payload_error_when_no_business():
    token = register_and_token("nobiz_user")
    h = auth(token)
    client.post("/content", json={"topic": "X", "platforms": ["linkedin"], "mode": "schedule"}, headers=h)
    r = client.get("/content?status=pending&mode=schedule&limit=1", headers=N8N_HEADERS)
    assert r.status_code == 200
    assert r.json()[0]["payload_error"] == "Business profile not found"