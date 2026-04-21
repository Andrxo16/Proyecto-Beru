from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.subinventario import Subinventario
from app.schemas.subinventario import SubinventarioCreate, SubinventarioResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subinventario", tags=["Subinventario"])


@router.post("/", response_model=SubinventarioResponse)
def create_subinventario(subinventario: SubinventarioCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating subinventario: {subinventario}")
        data = subinventario.model_dump(exclude_none=False)
        db_subinventario = Subinventario(**data)
        db.add(db_subinventario)
        db.commit()
        db.refresh(db_subinventario)
        logger.info(f"Subinventario created with ID: {db_subinventario.id}")
        return db_subinventario
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating subinventario: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/", response_model=List[SubinventarioResponse])
def get_subinventario(db: Session = Depends(get_db)):
    try:
        logger.info("Fetching all subinventario records")
        return db.query(Subinventario).all()
    except Exception as e:
        logger.error(f"Error fetching subinventario: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{subinventario_id}", response_model=SubinventarioResponse)
def get_subinventario_by_id(subinventario_id: int, db: Session = Depends(get_db)):
    try:
        subinventario = db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()
        if not subinventario:
            raise HTTPException(status_code=404, detail="Subinventario not found")
        return subinventario
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subinventario: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.put("/{subinventario_id}", response_model=SubinventarioResponse)
def update_subinventario(subinventario_id: int, subinventario_data: SubinventarioCreate, db: Session = Depends(get_db)):
    try:
        subinventario = db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()
        if not subinventario:
            raise HTTPException(status_code=404, detail="Subinventario not found")
        for key, value in subinventario_data.model_dump().items():
            setattr(subinventario, key, value)
        db.commit()
        db.refresh(subinventario)
        logger.info(f"Subinventario {subinventario_id} updated successfully")
        return subinventario
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating subinventario: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{subinventario_id}")
def delete_subinventario(subinventario_id: int, db: Session = Depends(get_db)):
    try:
        subinventario = db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()
        if not subinventario:
            raise HTTPException(status_code=404, detail="Subinventario not found")
        db.delete(subinventario)
        db.commit()
        logger.info(f"Subinventario {subinventario_id} deleted successfully")
        return {"message": "Subinventario deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting subinventario: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
