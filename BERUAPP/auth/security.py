import hashlib
import hmac
import json
import os
import secrets
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.equipment import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRETO_CAMBIAR_EN_PRODUCCION")
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 8


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(raw_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(raw_password), hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_MINUTES)
    )
    payload.update({"exp": int(expire.timestamp()), "nonce": secrets.token_hex(8)})
    encoded_payload = urlsafe_b64encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    ).decode("utf-8")
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"{encoded_payload}.{signature}"


def _permissions_dict(user: Usuario) -> dict[str, bool]:
    return {
        "can_dashboard": bool(user.can_dashboard),
        "can_inventory": bool(user.can_inventory),
        "can_warehouse": bool(user.can_warehouse),
        "can_clients": bool(user.can_clients),
        "can_rentals": bool(user.can_rentals),
        "can_permissions": bool(user.can_permissions),
    }


def user_to_payload(user: Usuario) -> dict:
    return {
        "sub": user.username,
        "uid": user.id,
        "permissions": _permissions_dict(user),
    }


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_error = HTTPException(status_code=401, detail="Token invalido o expirado")
    try:
        encoded_payload, provided_signature = token.split(".", 1)
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(provided_signature, expected_signature):
            raise credentials_error

        padded = encoded_payload + "=" * (-len(encoded_payload) % 4)
        payload = json.loads(urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
        exp = int(payload.get("exp", 0))
        if datetime.now(timezone.utc).timestamp() > exp:
            raise credentials_error
        uid = payload.get("uid")
        if not uid:
            raise credentials_error
    except (ValueError, json.JSONDecodeError, TypeError) as exc:
        raise credentials_error from exc

    user = db.query(Usuario).filter(Usuario.id == uid).first()
    if not user or not user.activo:
        raise HTTPException(status_code=401, detail="Usuario inactivo o inexistente")
    return user


def require_permission(permission_name: str):
    def _guard(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if not getattr(current_user, permission_name, False):
            raise HTTPException(status_code=403, detail="No tienes permiso para esta seccion")
        return current_user

    return _guard