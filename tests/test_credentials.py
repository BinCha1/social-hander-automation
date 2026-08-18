from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def register_and_token(username: str) -> str:
    r = client.post(
        "/auth/register",
        json={"username": username, "email": f"{username}@example.com", "password": "secret-password"},
    )
    return r.json()["access_token"]


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_credential_crud_flow():
    token = register_and_token("socialuser")
    h = auth(token)

    payload = {
        "platform": "facebook",
        "account_name": "My Page",
        "account_id": "123456789",
        "access_token": "EAAB-raw-token-1",
    }
    r = client.post("/credentials", json=payload, headers=h)
    assert r.status_code == 201
    body = r.json()
    assert body["platform"] == "facebook"
    assert "access_token" not in body
    assert "encrypted_access_token" not in body

    assert len(client.get("/credentials", headers=h).json()) == 1
    assert client.get("/credentials/facebook", headers=h).json()["account_id"] == "123456789"

    r = client.put("/credentials/facebook", json={"access_token": "EAAB-raw-token-2"}, headers=h)
    assert r.status_code == 200
    assert "access_token" not in r.json()

    assert client.delete("/credentials/facebook", headers=h).status_code == 204
    assert client.get("/credentials/facebook", headers=h).status_code == 404


def test_invalid_platform_rejected():
    token = register_and_token("badplatform")
    r = client.post(
        "/credentials",
        json={"platform": "twitter", "account_name": "X", "account_id": "1", "access_token": "t"},
        headers=auth(token),
    )
    assert r.status_code == 422


def test_users_isolated():
    token_a = register_and_token("cr_a")
    token_b = register_and_token("cr_b")
    client.post(
        "/credentials",
        json={"platform": "instagram", "account_name": "A", "account_id": "1", "access_token": "t"},
        headers=auth(token_a),
    )
    assert client.get("/credentials/instagram", headers=auth(token_b)).status_code == 404


def test_unauthenticated_rejected():
    assert client.get("/credentials").status_code == 401