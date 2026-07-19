import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from cryptography.fernet import Fernet
from fastapi import HTTPException, status

from app.config.settings import get_settings

JWT_ALGORITHM = "HS256"
PASSWORD_ITERATIONS = 260_000


def utc_now() -> datetime:
    return datetime.now(UTC)


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )
    return "pbkdf2_sha256${iterations}${salt}${digest}".format(
        iterations=PASSWORD_ITERATIONS,
        salt=base64.urlsafe_b64encode(salt).decode("ascii"),
        digest=base64.urlsafe_b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, password_hash: str) -> bool:
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


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def _json_default(value: Any) -> Any:
    if isinstance(value, datetime):
        return int(value.timestamp())
    return value


def create_access_token(*, subject: str, email: str | None = None) -> tuple[str, int]:
    settings = get_settings()
    expires_at = utc_now() + timedelta(minutes=settings.auth_access_token_minutes)
    payload: dict[str, Any] = {
        "sub": subject,
        "email": email,
        "type": "access",
        "iat": int(utc_now().timestamp()),
        "exp": int(expires_at.timestamp()),
        "jti": str(uuid4()),
    }
    token = encode_jwt(payload)
    return token, int(expires_at.timestamp())


def encode_jwt(payload: dict[str, Any]) -> str:
    settings = get_settings()
    header = {
        "alg": JWT_ALGORITHM,
        "typ": "JWT",
    }
    header_segment = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_segment = _b64url_encode(
        json.dumps(payload, default=_json_default, separators=(",", ":")).encode("utf-8")
    )
    signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
    signature = hmac.new(
        settings.auth_jwt_secret.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    return f"{header_segment}.{payload_segment}.{_b64url_encode(signature)}"


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        header_segment, payload_segment, signature_segment = token.split(".")
    except ValueError as exc:
        raise invalid_token_exception() from exc

    signing_input = f"{header_segment}.{payload_segment}".encode("ascii")
    expected_signature = hmac.new(
        settings.auth_jwt_secret.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    actual_signature = _b64url_decode(signature_segment)

    if not hmac.compare_digest(actual_signature, expected_signature):
        raise invalid_token_exception()

    try:
        header = json.loads(_b64url_decode(header_segment))
        payload = json.loads(_b64url_decode(payload_segment))
    except (ValueError, json.JSONDecodeError) as exc:
        raise invalid_token_exception() from exc

    if header.get("alg") != JWT_ALGORITHM or payload.get("type") != "access":
        raise invalid_token_exception()

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at <= int(utc_now().timestamp()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not payload.get("sub"):
        raise invalid_token_exception()

    return payload


def invalid_token_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid access token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
