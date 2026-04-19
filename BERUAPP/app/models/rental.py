from datetime import datetime
from sqlalchemy import Column, Date, Float, ForeignKey, Integer, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base


class Renta(Base):
    __tablename__ = "rentas"

    id = Column(Integer, primary_key=True, index=True)
    inventario_id = Column(Integer, ForeignKey("inventario.id"), nullable=False)
    fecha_inicio = Column(TIMESTAMP, default=datetime.utcnow)
    fecha_fin = Column(TIMESTAMP)
    tarifa_diaria = Column(Float, nullable=False)
    dias = Column(Integer)
    total = Column(Float)

    inventario = relationship("Inventario", back_populates="rentas")
