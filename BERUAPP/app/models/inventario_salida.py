from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP
from app.db.base import Base


class InventarioSalida(Base):
    __tablename__ = "inventario_salida"

    id = Column(Integer, primary_key=True, index=True)
    nombre_material = Column(String(150), nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
    unidades_vendidas = Column(Integer, default=0)
    fecha_venta = Column(TIMESTAMP, default=datetime.utcnow)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)