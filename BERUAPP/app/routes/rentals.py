from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.equipment import Inventario
from app.models.rental import Renta
from app.schemas.rental import RentaCreate, RentaResponse

router = APIRouter(prefix="/rentals", tags=["Rentals"])


@router.post("/", response_model=RentaResponse)
def create_rental(rental: RentaCreate, db: Session = Depends(get_db)):
    inventario = db.get(Inventario, rental.inventario_id)
    if not inventario:
        raise HTTPException(status_code=404, detail="Inventario not found")

    db_rental = Renta(**rental.dict())
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental


@router.get("/", response_model=List[RentaResponse])
def get_rentals(db: Session = Depends(get_db)):
    return db.query(Renta).all()