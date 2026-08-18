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


def test_business_crud_flow():
    token = register_and_token("owner")
    h = auth(token)

    assert client.get("/business/profile", headers=h).status_code == 404

    payload = {"name": "Acme Agency", "type": "Agency", "website": "https://acme.com"}
    r = client.post("/business/profile", json=payload, headers=h)
    assert r.status_code == 201
    business_id = r.json()["id"]

    assert client.get("/business/profile", headers=h).json()["name"] == "Acme Agency"

    r = client.put("/business/profile", json={"brand_tone": "Friendly"}, headers=h)
    assert r.status_code == 200
    assert r.json()["brand_tone"] == "Friendly"
    assert r.json()["id"] == business_id

    assert client.delete("/business/profile", headers=h).status_code == 204
    assert client.get("/business/profile", headers=h).status_code == 404


def test_upsert_keeps_same_id():
    token = register_and_token("owner2")
    h = auth(token)
    first = client.post("/business/profile", json={"name": "One"}, headers=h).json()
    second = client.post("/business/profile", json={"name": "Two"}, headers=h).json()
    assert second["id"] == first["id"]
    assert second["name"] == "Two"


def test_users_isolated():
    client.post("/business/profile", json={"name": "A Biz"}, headers=auth(register_and_token("iso_a")))
    assert client.get("/business/profile", headers=auth(register_and_token("iso_b"))).status_code == 404


def test_unauthenticated_rejected():
    assert client.get("/business/profile").status_code == 401
    assert client.post("/business/profile", json={"name": "X"}).status_code == 401