from datetime import datetime, timedelta, timezone
from typing import Annotated
import secrets

import hmac
import jwt
import base64
import hashlib
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from cryptography.fernet import Fernet
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from app.core.config import get_settings

settings = get_settings()

ALGORITHM = "HS256"

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")

DUMMY_HASH = password_hash.hash("dummypassword")


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except InvalidTokenError:
        return None


def generate_password_reset_token() -> str:
    return secrets.token_urlsafe(32)


fernet_key = base64.urlsafe_b64encode(
    hashlib.sha256(settings.secret_key.encode()).digest()
)
_cipher_suite = Fernet(fernet_key)

def encrypt_credential(plain_text: str) -> str:
    return _cipher_suite.encrypt(plain_text.encode()).decode()


def decrypt_credential(cipher_text: str) -> str:
    return _cipher_suite.decrypt(cipher_text.encode()).decode()



def verify_n8n_secret(secret: str) -> bool:
    return bool(settings.n8n_webhook_secret) and hmac.compare_digest(
        settings.n8n_webhook_secret, secret
    )

def verify_interaction_signature(
    public_key_hex: str, signature_hex: str, timestamp: str, raw_body: bytes
) -> bool:
    if not public_key_hex or not signature_hex or not timestamp:
        return False
    try:
        public_key = Ed25519PublicKey.from_public_bytes(bytes.fromhex(public_key_hex))
        public_key.verify(bytes.fromhex(signature_hex), timestamp.encode() + raw_body)
        return True
    except (ValueError, InvalidSignature):
        return False