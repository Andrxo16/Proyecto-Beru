from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.equipment import Cliente
from app.schemas.equipment import ClientCreate, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients"])

def _refresh_client_status(client: Cliente, db: Session) -> None:
    if client.created_at:
        now = datetime.now(timezone.utc)
        created = client.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        else:
            created = created.astimezone(timezone.utc)
        is_active = created >= (now - timedelta(days=30))
        client.estado = "activo" if is_active else "inactivo"
    else:
        client.estado = "activo"


@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    try:
        new_client = Cliente(
            nombre=client.nombre,
            correo=client.correo,
            telefono=client.telefono,
            numero_alquileres=0,
            estado="activo",
        )
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
        return new_client
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudo guardar el cliente. Revisa permisos del usuario de BD sobre la tabla clientes.",
        ) from exc


@router.get("/", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    try:
        clients = db.query(Cliente).order_by(Cliente.id.desc()).all()
        for client in clients:
            _refresh_client_status(client, db)
        db.commit()
        return clients
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="No se pudieron consultar clientes. Revisa permisos del usuario de BD sobre la tabla clientes.",
        ) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al listar clientes: {exc!s}",
        ) from exc