from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.equipment import Inventario
from app.schemas.equipment import EquipmentCreate, EquipmentResponse

router = APIRouter(prefix="/equipment", tags=["Equipment"])

@router.post("/", response_model=EquipmentResponse)
def create_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    new_equipment = Inventario(**equipment.model_dump())
    db.add(new_equipment)
    db.commit()
    db.refresh(new_equipment)
    return new_equipment


@router.get("/", response_model=List[EquipmentResponse])
def get_equipment(db: Session = Depends(get_db)):
    items = db.query(Inventario).order_by(Inventario.id.desc()).all()
    return items