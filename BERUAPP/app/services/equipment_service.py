from sqlalchemy.orm import Session
from app.models.equipment import Inventario
from app.schemas.equipment import InventarioCreate, InventarioResponse


def create_equipment(db: Session, equipment: InventarioCreate) -> Inventario:
    db_equipment = Inventario(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment


def get_all_equipment(db: Session) -> list:
    return db.query(Inventario).all()


def get_equipment_by_id(db: Session, equipment_id: int):
    return db.query(Inventario).filter(Inventario.id == equipment_id).first()


def update_equipment(db: Session, equipment_id: int, equipment_update: InventarioCreate):
    db_equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if db_equipment:
        for key, value in equipment_update.dict().items():
            setattr(db_equipment, key, value)
        db.commit()
        db.refresh(db_equipment)
    return db_equipment


def delete_equipment(db: Session, equipment_id: int) -> bool:
    db_equipment = db.query(Inventario).filter(Inventario.id == equipment_id).first()
    if db_equipment:
        db.delete(db_equipment)
        db.commit()
        return True
    return False
