import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet
from fastapi import HTTPException, status

from app.core.config import get_settings

JWT_ALGORITHM = "HS256"
LEGACY_PBKDF2_ITERATIONS = 260_000

_password_hasher = PasswordHasher()


def utc_now() -> datetime:
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    # New hashes use argon2; legacy rows use the old pbkdf2_sha256$... format.
    if password_hash.startswith("pbkdf2_sha256$"):
        return _verify_legacy_pbkdf2(password, password_hash)

    try:
        return _password_hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def _verify_legacy_pbkdf2(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected_digest = password_hash.split("$")
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        base64.urlsafe_b64decode(salt.encode("ascii")),
        int(iterations),
    )
    actual_digest = base64.urlsafe_b64encode(digest).decode("ascii")
    return hmac.compare_digest(actual_digest, expected_digest)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _fernet_key() -> bytes:
    secret = get_settings().credentials_secret.encode("utf-8")
    digest = hashlib.sha256(secret).digest()
    return base64.urlsafe_b64encode(digest)


def encrypt_secret(value: str) -> str:
    return Fernet(_fernet_key()).encrypt(value.encode("utf-8")).decode("ascii")


def decrypt_secret(value: str) -> str:
    return Fernet(_fernet_key()).decrypt(value.encode("ascii")).decode("utf-8")


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def create_access_token(*, subject: str, email: str | None = None) -> tuple[str, int]:
    settings = get_settings()
    issued_at = utc_now()
    expires_at = issued_at + timedelta(minutes=settings.auth_access_token_minutes)
    payload: dict[str, Any] = {
        "sub": subject,
        "email": email,
        "type": "access",
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
        "jti": str(uuid4()),
    }
    token = jwt.encode(payload, settings.auth_jwt_secret, algorithm=JWT_ALGORITHM)
    return token, int(expires_at.timestamp())


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise invalid_token_exception() from exc

    if payload.get("type") != "access" or not payload.get("sub"):
        raise invalid_token_exception()

    return payload


def invalid_token_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid access token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
