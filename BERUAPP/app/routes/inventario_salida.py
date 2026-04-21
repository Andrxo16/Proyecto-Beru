from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.inventario_salida import InventarioSalida
from app.schemas.inventario_salida import InventarioSalidaCreate, InventarioSalidaResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inventario-salida", tags=["Inventario Salida"])


@router.post("/", response_model=InventarioSalidaResponse)
def create_inventario_salida(inventario_salida: InventarioSalidaCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating inventario_salida: {inventario_salida}")
        data = inventario_salida.model_dump(exclude_none=False)
        db_inventario_salida = InventarioSalida(**data)
        db.add(db_inventario_salida)
        db.commit()
        db.refresh(db_inventario_salida)
        logger.info(f"Inventario Salida created with ID: {db_inventario_salida.id}")
        return db_inventario_salida
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating inventario_salida: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/", response_model=List[InventarioSalidaResponse])
def get_inventario_salida(db: Session = Depends(get_db)):
    try:
        logger.info("Fetching all inventario_salida records")
        return db.query(InventarioSalida).all()
    except Exception as e:
        logger.error(f"Error fetching inventario_salida: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{inventario_salida_id}", response_model=InventarioSalidaResponse)
def get_inventario_salida_by_id(inventario_salida_id: int, db: Session = Depends(get_db)):
    try:
        inventario_salida = db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()
        if not inventario_salida:
            raise HTTPException(status_code=404, detail="Inventario Salida not found")
        return inventario_salida
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching inventario_salida: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.put("/{inventario_salida_id}", response_model=InventarioSalidaResponse)
def update_inventario_salida(inventario_salida_id: int, inventario_salida_data: InventarioSalidaCreate, db: Session = Depends(get_db)):
    try:
        inventario_salida = db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()
        if not inventario_salida:
            raise HTTPException(status_code=404, detail="Inventario Salida not found")
        
        for key, value in inventario_salida_data.model_dump().items():
            setattr(inventario_salida, key, value)
        
        db.commit()
        db.refresh(inventario_salida)
        logger.info(f"Inventario Salida {inventario_salida_id} updated successfully")
        return inventario_salida
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating inventario_salida: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{inventario_salida_id}")
def delete_inventario_salida(inventario_salida_id: int, db: Session = Depends(get_db)):
    try:
        inventario_salida = db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()
        if not inventario_salida:
            raise HTTPException(status_code=404, detail="Inventario Salida not found")
        db.delete(inventario_salida)
        db.commit()
        logger.info(f"Inventario Salida {inventario_salida_id} deleted successfully")
        return {"message": "Inventario Salida deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting inventario_salida: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
