from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.equipment import Usuario
from app.schemas.equipment import AuthResponse, UserLogin, UserPermissions, UserResponse
from auth.security import (
    create_access_token,
    get_current_user,
    hash_password,
    user_to_payload,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


def _as_user_response(user: Usuario) -> UserResponse:
    return UserResponse(
        id=user.id,
        username=user.username,
        activo=bool(user.activo),
        permissions=UserPermissions(
            can_dashboard=bool(user.can_dashboard),
            can_inventory=bool(user.can_inventory),
            can_warehouse=bool(user.can_warehouse),
            can_clients=bool(user.can_clients),
            can_rentals=bool(user.can_rentals),
            can_permissions=bool(user.can_permissions),
        ),
        created_at=user.created_at,
    )


def _ensure_seed_admin(db: Session) -> None:
    exists = db.query(Usuario).first()
    if exists:
        return

    admin = Usuario(
        username="admin",
        password_hash=hash_password("admin123"),
        activo=True,
        can_dashboard=True,
        can_inventory=True,
        can_warehouse=True,
        can_clients=True,
        can_rentals=True,
        can_permissions=True,
    )
    db.add(admin)
    db.commit()


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    try:
        _ensure_seed_admin(db)
        user = db.query(Usuario).filter(Usuario.username == payload.username.strip()).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Usuario o contrasena invalido")
        if not user.activo:
            raise HTTPException(status_code=403, detail="Usuario inactivo")

        token = create_access_token(user_to_payload(user))
        return AuthResponse(access_token=token, user=_as_user_response(user))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="No se pudo iniciar sesion. Revisa permisos del usuario de BD sobre la tabla usuarios.",
        ) from exc


@router.get("/me", response_model=UserResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return _as_user_response(current_user)
