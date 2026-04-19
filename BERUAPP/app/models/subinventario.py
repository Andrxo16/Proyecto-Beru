from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Subinventario(Base):
    __tablename__ = "subinventario"

    id = Column(Integer, primary_key=True, index=True)
    inventario_id = Column(Integer, ForeignKey("inventario.id"), nullable=False)
    nombre_item = Column(String(150), nullable=False)
    cantidad = Column(Integer, default=1)
    descripcion = Column(Text)

    inventario = relationship("Inventario", back_populates="subinventarios")