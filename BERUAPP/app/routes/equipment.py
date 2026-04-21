from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.equipment import Inventario
from app.schemas.equipment import InventarioCreate, InventarioResponse
from app.services.equipment_service import (
    create_equipment,
    get_all_equipment,
    get_equipment_by_id,
    update_equipment,
    delete_equipment,
)

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.post("/", response_model=InventarioResponse)
def create_equipment_endpoint(equipment: InventarioCreate, db: Session = Depends(get_db)):
    return create_equipment(db, equipment)


@router.get("/", response_model=List[InventarioResponse])
def get_equipment(db: Session = Depends(get_db)):
    return get_all_equipment(db)


@router.get("/{equipment_id}", response_model=InventarioResponse)
def get_equipment_by_id_endpoint(equipment_id: int, db: Session = Depends(get_db)):
    db_equipment = get_equipment_by_id(db, equipment_id)
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment


@router.put("/{equipment_id}", response_model=InventarioResponse)
def update_equipment_endpoint(equipment_id: int, equipment_update: InventarioCreate, db: Session = Depends(get_db)):
    db_equipment = update_equipment(db, equipment_id, equipment_update)
    if db_equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return db_equipment


@router.delete("/{equipment_id}")
def delete_equipment_endpoint(equipment_id: int, db: Session = Depends(get_db)):
    success = delete_equipment(db, equipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {"message": "Equipment deleted successfully"}
