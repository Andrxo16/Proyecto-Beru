from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.inventario_salida import InventarioSalida
from app.schemas.inventario_salida import InventarioSalidaCreate, InventarioSalidaResponse

router = APIRouter(prefix="/inventario-salida", tags=["Inventario Salida"])


@router.post("/", response_model=InventarioSalidaResponse)
def create_inventario_salida(inventario_salida: InventarioSalidaCreate, db: Session = Depends(get_db)):
    db_inventario_salida = InventarioSalida(**inventario_salida.dict())
    db.add(db_inventario_salida)
    db.commit()
    db.refresh(db_inventario_salida)
    return db_inventario_salida


@router.get("/", response_model=List[InventarioSalidaResponse])
def get_inventario_salida(db: Session = Depends(get_db)):
    return db.query(InventarioSalida).all()