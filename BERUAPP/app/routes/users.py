from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.equipment import Usuario
from app.schemas.equipment import UserCreate, UserPermissions, UserResponse, UserUpdatePermissions
from auth.security import hash_password, require_permission

router = APIRouter(prefix="/users", tags=["Users"])


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
            can_inventory_show_id=bool(getattr(user, "can_inventory_show_id", True)),
            can_inventory_show_tarifa=bool(
                getattr(user, "can_inventory_show_tarifa", True)
            ),
        ),
        created_at=user.created_at,
    )


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_permissions")),
):
    try:
        users = db.query(Usuario).order_by(Usuario.id.desc()).all()
        return [_as_user_response(user) for user in users]
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="No se pudieron consultar usuarios. Crea la tabla usuarios en PostgreSQL.",
        ) from exc


@router.post("/", response_model=UserResponse)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_permissions")),
):
    username = payload.username.strip().lower()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="El usuario debe tener al menos 3 caracteres")
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="La contrasena debe tener al menos 4 caracteres")

    try:
        exists = db.query(Usuario).filter(Usuario.username == username).first()
        if exists:
            raise HTTPException(status_code=409, detail="El nombre de usuario ya existe")

        user = Usuario(
            username=username,
            password_hash=hash_password(payload.password),
            activo=payload.activo,
            can_dashboard=payload.permissions.can_dashboard,
            can_inventory=payload.permissions.can_inventory,
            can_warehouse=payload.permissions.can_warehouse,
            can_clients=payload.permissions.can_clients,
            can_rentals=payload.permissions.can_rentals,
            can_permissions=payload.permissions.can_permissions,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return _as_user_response(user)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo crear el usuario. Revisa permisos de BD sobre la tabla usuarios.",
        ) from exc


@router.patch("/{user_id}", response_model=UserResponse)
def update_user_permissions(
    user_id: int,
    payload: UserUpdatePermissions,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_permissions")),
):
    try:
        user = db.query(Usuario).filter(Usuario.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        user.activo = payload.activo
        user.can_dashboard = payload.permissions.can_dashboard
        user.can_inventory = payload.permissions.can_inventory
        user.can_warehouse = payload.permissions.can_warehouse
        user.can_clients = payload.permissions.can_clients
        user.can_rentals = payload.permissions.can_rentals
        user.can_permissions = payload.permissions.can_permissions

        db.commit()
        db.refresh(user)
        return _as_user_response(user)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="No se pudo actualizar el usuario") from exc
