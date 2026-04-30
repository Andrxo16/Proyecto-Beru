from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.equipment import Inventario, Subinventario
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentResponse,
    SubinventoryCreate,
    SubinventoryResponse,
)
from auth.security import require_permission

router = APIRouter(prefix="/equipment", tags=["Equipment"])

@router.post("/", response_model=EquipmentResponse)
def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_inventory")),
):
    new_equipment = Inventario(**equipment.model_dump())
    db.add(new_equipment)
    db.commit()
    db.refresh(new_equipment)
    return new_equipment


@router.get("/", response_model=List[EquipmentResponse])
def get_equipment(
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_inventory")),
):
    items = db.query(Inventario).order_by(Inventario.id.desc()).all()
    return items


@router.get("/{equipment_id}/subinventory", response_model=List[SubinventoryResponse])
def get_subinventory_by_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_inventory")),
):
    equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    items = (
        db.query(Subinventario)
        .filter(Subinventario.inventario_id == equipment_id)
        .order_by(Subinventario.id.desc())
        .all()
    )
    return items


@router.post("/{equipment_id}/subinventory", response_model=SubinventoryResponse)
def create_subinventory_item(
    equipment_id: int,
    payload: SubinventoryCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("can_inventory")),
):
    equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    if payload.cantidad < 1:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor o igual a 1")

    new_item = Subinventario(
        inventario_id=equipment_id,
        nombre_item=payload.nombre_item,
        cantidad=payload.cantidad,
        descripcion=payload.descripcion,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item