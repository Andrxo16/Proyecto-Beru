from sqlalchemy.orm import Session
from app.models.subinventario import Subinventario
from app.schemas.subinventario import SubinventarioCreate, SubinventarioResponse


def create_subinventario(db: Session, subinventario: SubinventarioCreate) -> Subinventario:
    db_subinventario = Subinventario(**subinventario.dict())
    db.add(db_subinventario)
    db.commit()
    db.refresh(db_subinventario)
    return db_subinventario


def get_all_subinventario(db: Session) -> list:
    return db.query(Subinventario).all()


def get_subinventario_by_id(db: Session, subinventario_id: int):
    return db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()


def update_subinventario(db: Session, subinventario_id: int, subinventario_update: SubinventarioCreate):
    db_subinventario = db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()
    if db_subinventario:
        for key, value in subinventario_update.dict().items():
            setattr(db_subinventario, key, value)
        db.commit()
        db.refresh(db_subinventario)
    return db_subinventario


def delete_subinventario(db: Session, subinventario_id: int) -> bool:
    db_subinventario = db.query(Subinventario).filter(Subinventario.id == subinventario_id).first()
    if db_subinventario:
        db.delete(db_subinventario)
        db.commit()
        return True
    return False
