from typing import List
import logging
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.equipment import Inventario
from app.schemas.equipment import InventarioCreate, InventarioResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.post("/", response_model=InventarioResponse)
def create_equipment(equipment: InventarioCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Received equipment data: {equipment}")
        
        # Pydantic ya validó y convirtió los tipos, solo convertir a dict
        data = equipment.model_dump(exclude_none=False)
        
        logger.info(f"Creating equipment with data: {data}")
        
        # Crear el objeto directamente
        db_equipment = Inventario(**data)
        db.add(db_equipment)
        db.commit()
        db.refresh(db_equipment)
        
        logger.info(f"Equipment created successfully: ID {db_equipment.id}")
        return db_equipment
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating equipment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/", response_model=List[InventarioResponse])
def get_equipment(db: Session = Depends(get_db)):
    try:
        logger.info("Obteniendo lista de equipos")
        equipos = db.query(Inventario).all()
        logger.info(f"Total de equipos: {len(equipos)}")
        return equipos
    except Exception as e:
        logger.error(f"Error al obtener equipos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al obtener equipos")


@router.get("/{equipment_id}", response_model=InventarioResponse)
def get_equipment_by_id(equipment_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Buscando equipo: ID {equipment_id}")
        equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
        if not equipment:
            logger.warning(f"Equipo no encontrado: ID {equipment_id}")
            raise HTTPException(status_code=404, detail=f"Equipo con ID {equipment_id} no encontrado")
        return equipment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener equipo {equipment_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al obtener equipo")


@router.put("/{equipment_id}", response_model=InventarioResponse)
def update_equipment(equipment_id: int, equipment_data: InventarioCreate, db: Session = Depends(get_db)):
    equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    for key, value in equipment_data.dict().items():
        setattr(equipment, key, value)
    db.commit()
    db.refresh(equipment)
    return equipment


@router.delete("/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    db.delete(equipment)
    db.commit()
    return {"message": "Equipment deleted successfully"}
