from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.subinventario import Subinventario
from app.schemas.subinventario import SubinventarioCreate, SubinventarioResponse
from app.services.subinventario_service import (
    create_subinventario,
    get_all_subinventario,
    get_subinventario_by_id,
    update_subinventario,
    delete_subinventario,
)

router = APIRouter(prefix="/subinventario", tags=["Subinventario"])


@router.post("/", response_model=SubinventarioResponse)
def create_subinventario_endpoint(subinventario: SubinventarioCreate, db: Session = Depends(get_db)):
    return create_subinventario(db, subinventario)


@router.get("/", response_model=List[SubinventarioResponse])
def get_subinventario(db: Session = Depends(get_db)):
    return get_all_subinventario(db)


@router.get("/{subinventario_id}", response_model=SubinventarioResponse)
def get_subinventario_by_id_endpoint(subinventario_id: int, db: Session = Depends(get_db)):
    db_subinventario = get_subinventario_by_id(db, subinventario_id)
    if db_subinventario is None:
        raise HTTPException(status_code=404, detail="Subinventario not found")
    return db_subinventario


@router.put("/{subinventario_id}", response_model=SubinventarioResponse)
def update_subinventario_endpoint(subinventario_id: int, subinventario_update: SubinventarioCreate, db: Session = Depends(get_db)):
    db_subinventario = update_subinventario(db, subinventario_id, subinventario_update)
    if db_subinventario is None:
        raise HTTPException(status_code=404, detail="Subinventario not found")
    return db_subinventario


@router.delete("/{subinventario_id}")
def delete_subinventario_endpoint(subinventario_id: int, db: Session = Depends(get_db)):
    success = delete_subinventario(db, subinventario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subinventario not found")
    return {"message": "Subinventario deleted successfully"}
