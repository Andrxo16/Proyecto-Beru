from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.subinventario import Subinventario
from app.schemas.subinventario import SubinventarioCreate, SubinventarioResponse

router = APIRouter(prefix="/subinventario", tags=["Subinventario"])


@router.post("/", response_model=SubinventarioResponse)
def create_subinventario(subinventario: SubinventarioCreate, db: Session = Depends(get_db)):
    db_subinventario = Subinventario(**subinventario.dict())
    db.add(db_subinventario)
    db.commit()
    db.refresh(db_subinventario)
    return db_subinventario


@router.get("/", response_model=List[SubinventarioResponse])
def get_subinventario(db: Session = Depends(get_db)):
    return db.query(Subinventario).all()