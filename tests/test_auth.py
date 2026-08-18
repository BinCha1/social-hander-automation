from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login_and_me():
    r = client.post(
        "/api/v1/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "secret-password",
            "full_name": "Alice",
        },
    )
    assert r.status_code == 201
    token = r.json()["access_token"]

    r = client.post("/api/v1/token", data={"username": "alice", "password": "secret-password"})
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"

    r = client.get("/api/v1/auth/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "alice"


def test_duplicate_username_rejected():
    payload = {
        "username": "bob",
        "email": "bob@example.com",
        "password": "secret-password",
    }
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    assert client.post("/api/v1/auth/register", json=payload).status_code == 409


def test_wrong_password_rejected():
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "carol",
            "email": "carol@example.com",
            "password": "secret-password",
        },
    )
    r = client.post("/api/v1/token", data={"username": "carol", "password": "wrong-password"})
    assert r.status_code == 401