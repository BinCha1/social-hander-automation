def register_and_token(client, username: str) -> str:
    r = client.post(
        "/api/v1/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret-password"},
    )
    return r.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def make_content(client, headers: dict) -> str:
    r = client.post(
        "/api/v1/content",
        json={"topic": "Launch day", "platforms": ["facebook", "instagram"], "mode": "instant"},
        headers=headers,
    )
    assert r.status_code == 201
    return r.json()["id"]


def test_content_crud_flow(client):
    token = register_and_token(client, "creator")
    h = auth(token)

    r = client.post(
        "/api/v1/content",
        json={"topic": "Hello world", "platforms": ["linkedin"], "mode": "schedule", "publish_date": "2026-08-18"},
        headers=h,
    )
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "pending"
    assert body["mode"] == "schedule"

    cid = body["id"]
    assert client.get("/api/v1/content", headers=h).status_code == 200
    assert client.get(f"/api/v1/content/{cid}", headers=h).json()["topic"] == "Hello world"

    r = client.put(f"/api/v1/content/{cid}", json={"cta": "Buy now"}, headers=h)
    assert r.json()["cta"] == "Buy now"

    assert client.delete(f"/api/v1/content/{cid}", headers=h).status_code == 204
    assert client.get(f"/api/v1/content/{cid}", headers=h).status_code == 404


def test_n8n_engine_access(client, n8n_headers):
    token = register_and_token(client, "engine_user")
    h = auth(token)
    cid = make_content(client, h)

    r = client.patch(f"/api/v1/content/{cid}", json={"status": "processing"}, headers=n8n_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "processing"

    r = client.put(f"/api/v1/content/{cid}/approval-resume", json={"resume_url": "https://n8n.example/wait/abc"}, headers=n8n_headers)
    assert r.status_code == 200


def test_bad_n8n_secret_rejected(client):
    assert client.get("/api/v1/content", headers={"X-N8N-Webhook-Secret": "wrong"}).status_code == 401


def test_users_isolated(client):
    token_a = register_and_token(client, "cont_a")
    token_b = register_and_token(client, "cont_b")
    cid = make_content(client, auth(token_a))
    assert client.get(f"/api/v1/content/{cid}", headers=auth(token_b)).status_code == 404


def test_unauthenticated_rejected(client):
    assert client.get("/api/v1/content").status_code == 401
