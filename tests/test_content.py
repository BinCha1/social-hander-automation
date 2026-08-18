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


def make_content(headers: dict) -> str:
    r = client.post(
        "/content",
        json={"topic": "Launch day", "platforms": ["facebook", "instagram"], "mode": "instant"},
        headers=headers,
    )
    assert r.status_code == 201
    return r.json()["id"]


def test_content_crud_flow():
    token = register_and_token("creator")
    h = auth(token)

    r = client.post(
        "/content",
        json={"topic": "Hello world", "platforms": ["linkedin"], "mode": "schedule", "publish_date": "2026-08-18"},
        headers=h,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "pending"
    assert body["mode"] == "schedule"

    cid = body["id"]
    assert client.get("/content", headers=h).status_code == 200
    assert client.get(f"/content/{cid}", headers=h).json()["topic"] == "Hello world"

    r = client.put(f"/content/{cid}", json={"cta": "Buy now"}, headers=h)
    assert r.json()["cta"] == "Buy now"

    assert client.delete(f"/content/{cid}", headers=h).status_code == 204
    assert client.get(f"/content/{cid}", headers=h).status_code == 404


def test_n8n_engine_access():
    token = register_and_token("engine_user")
    h = auth(token)
    cid = make_content(h)

    r = client.patch(f"/content/{cid}", json={"status": "processing"}, headers=N8N_HEADERS)
    assert r.status_code == 200
    assert r.json()["status"] == "processing"

    r = client.put(f"/content/{cid}/approval-resume", json={"resume_url": "https://n8n.example/wait/abc"}, headers=N8N_HEADERS)
    assert r.status_code == 200


def test_bad_n8n_secret_rejected():
    assert client.get("/content", headers={"X-N8N-Webhook-Secret": "wrong"}).status_code == 401


def test_users_isolated():
    token_a = register_and_token("cont_a")
    token_b = register_and_token("cont_b")
    cid = make_content(auth(token_a))
    assert client.get(f"/content/{cid}", headers=auth(token_b)).status_code == 404


def test_unauthenticated_rejected():
    assert client.get("/content").status_code == 401