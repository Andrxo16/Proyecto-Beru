from datetime import datetime
from sqlalchemy import Column, Float, Integer, String, Text, Numeric, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.base import Base


class Inventario(Base):
    __tablename__ = "inventario"

    id = Column(Integer, primary_key=True, index=True)
    nombre_equipo = Column(String(150), nullable=False)
    ubicacion = Column(String(150))
    historia_uso = Column(Text)
    valor_inicial = Column(Numeric(12, 2))
    estado = Column(String(20), default='disponible')
    marca = Column(String(100))
    modelo = Column(String(100))
    categoria = Column(String(100))
    anio = Column(Integer)
    tarifa_diaria = Column(Numeric(10, 2))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    subinventarios = relationship("Subinventario", back_populates="inventario")
    rentas = relationship("Renta", back_populates="inventario")
