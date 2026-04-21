from sqlalchemy.orm import Session
from app.models.inventario_salida import InventarioSalida
from app.schemas.inventario_salida import InventarioSalidaCreate, InventarioSalidaResponse


def create_inventario_salida(db: Session, inventario_salida: InventarioSalidaCreate) -> InventarioSalida:
    db_inventario_salida = InventarioSalida(**inventario_salida.dict())
    db.add(db_inventario_salida)
    db.commit()
    db.refresh(db_inventario_salida)
    return db_inventario_salida


def get_all_inventario_salida(db: Session) -> list:
    return db.query(InventarioSalida).all()


def get_inventario_salida_by_id(db: Session, inventario_salida_id: int):
    return db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()


def update_inventario_salida(db: Session, inventario_salida_id: int, inventario_salida_update: InventarioSalidaCreate):
    db_inventario_salida = db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()
    if db_inventario_salida:
        for key, value in inventario_salida_update.dict().items():
            setattr(db_inventario_salida, key, value)
        db.commit()
        db.refresh(db_inventario_salida)
    return db_inventario_salida


def delete_inventario_salida(db: Session, inventario_salida_id: int) -> bool:
    db_inventario_salida = db.query(InventarioSalida).filter(InventarioSalida.id == inventario_salida_id).first()
    if db_inventario_salida:
        db.delete(db_inventario_salida)
        db.commit()
        return True
    return False
