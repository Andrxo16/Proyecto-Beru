from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.inventario_salida import InventarioSalida
from app.schemas.inventario_salida import InventarioSalidaCreate, InventarioSalidaResponse
from app.services.inventario_salida_service import (
    create_inventario_salida,
    get_all_inventario_salida,
    get_inventario_salida_by_id,
    update_inventario_salida,
    delete_inventario_salida,
)

router = APIRouter(prefix="/inventario-salida", tags=["Inventario Salida"])


@router.post("/", response_model=InventarioSalidaResponse)
def create_inventario_salida_endpoint(inventario_salida: InventarioSalidaCreate, db: Session = Depends(get_db)):
    return create_inventario_salida(db, inventario_salida)


@router.get("/", response_model=List[InventarioSalidaResponse])
def get_inventario_salida(db: Session = Depends(get_db)):
    return get_all_inventario_salida(db)


@router.get("/{inventario_salida_id}", response_model=InventarioSalidaResponse)
def get_inventario_salida_by_id_endpoint(inventario_salida_id: int, db: Session = Depends(get_db)):
    db_inventario_salida = get_inventario_salida_by_id(db, inventario_salida_id)
    if db_inventario_salida is None:
        raise HTTPException(status_code=404, detail="Inventario Salida not found")
    return db_inventario_salida


@router.put("/{inventario_salida_id}", response_model=InventarioSalidaResponse)
def update_inventario_salida_endpoint(inventario_salida_id: int, inventario_salida_update: InventarioSalidaCreate, db: Session = Depends(get_db)):
    db_inventario_salida = update_inventario_salida(db, inventario_salida_id, inventario_salida_update)
    if db_inventario_salida is None:
        raise HTTPException(status_code=404, detail="Inventario Salida not found")
    return db_inventario_salida


@router.delete("/{inventario_salida_id}")
def delete_inventario_salida_endpoint(inventario_salida_id: int, db: Session = Depends(get_db)):
    success = delete_inventario_salida(db, inventario_salida_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventario Salida not found")
    return {"message": "Inventario Salida deleted successfully"}
