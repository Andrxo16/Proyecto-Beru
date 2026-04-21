from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.equipment import Inventario
from app.models.rental import Renta
from app.schemas.rental import RentaCreate, RentaResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rentals", tags=["Rentals"])


@router.post("/", response_model=RentaResponse)
def create_rental(rental: RentaCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating rental: {rental}")
        inventario = db.query(Inventario).filter(Inventario.id == rental.inventario_id).first()
        if not inventario:
            raise HTTPException(status_code=404, detail="Inventario not found")

        data = rental.model_dump(exclude_none=False)
        db_rental = Renta(**data)
        db.add(db_rental)
        db.commit()
        db.refresh(db_rental)
        logger.info(f"Rental created with ID: {db_rental.id}")
        return db_rental
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating rental: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/", response_model=List[RentaResponse])
def get_rentals(db: Session = Depends(get_db)):
    try:
        logger.info("Fetching all rentals")
        return db.query(Renta).all()
    except Exception as e:
        logger.error(f"Error fetching rentals: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{rental_id}", response_model=RentaResponse)
def get_rental_by_id(rental_id: int, db: Session = Depends(get_db)):
    try:
        rental = db.query(Renta).filter(Renta.id == rental_id).first()
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")
        return rental
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching rental: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.put("/{rental_id}", response_model=RentaResponse)
def update_rental(rental_id: int, rental_data: RentaCreate, db: Session = Depends(get_db)):
    try:
        rental = db.query(Renta).filter(Renta.id == rental_id).first()
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")
        
        inventario = db.query(Inventario).filter(Inventario.id == rental_data.inventario_id).first()
        if not inventario:
            raise HTTPException(status_code=404, detail="Inventario not found")
        
        for key, value in rental_data.model_dump().items():
            setattr(rental, key, value)
        db.commit()
        db.refresh(rental)
        logger.info(f"Rental {rental_id} updated successfully")
        return rental
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating rental: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{rental_id}")
def delete_rental(rental_id: int, db: Session = Depends(get_db)):
    try:
        rental = db.query(Renta).filter(Renta.id == rental_id).first()
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")
        db.delete(rental)
        db.commit()
        logger.info(f"Rental {rental_id} deleted successfully")
        return {"message": "Rental deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting rental: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")