from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.equipment import Inventario
from app.schemas.equipment import InventarioCreate, InventarioResponse

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.post("/", response_model=InventarioResponse)
def create_equipment(equipment: InventarioCreate, db: Session = Depends(get_db)):
    db_equipment = Inventario(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


@router.get("/", response_model=List[InventarioResponse])
def get_equipment(db: Session = Depends(get_db)):
    return db.query(Inventario).all()