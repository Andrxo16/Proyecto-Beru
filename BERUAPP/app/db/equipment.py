from sqlalchemy import Boolean, Column, Integer, String, Text, Numeric, TIMESTAMP, ForeignKey, text
from sqlalchemy.orm import relationship
from app.db.database import Base

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
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    
    # Relationships
    subinventarios = relationship("Subinventario", back_populates="inventario")
    rentas = relationship("Renta", back_populates="inventario")

class Subinventario(Base):
    __tablename__ = "subinventario"
    
    id = Column(Integer, primary_key=True, index=True)
    inventario_id = Column(Integer, ForeignKey("inventario.id"), nullable=False)
    nombre_item = Column(String(150), nullable=False)
    cantidad = Column(Integer, default=1)
    descripcion = Column(Text)
    
    # Relationships
    inventario = relationship("Inventario", back_populates="subinventarios")

class InventarioSalida(Base):
    __tablename__ = "inventario_salida"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_material = Column(String(150), nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
    unidades_vendidas = Column(Integer, default=0)
    fecha_venta = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

class Renta(Base):
    __tablename__ = "rentas"
    
    id = Column(Integer, primary_key=True, index=True)
    inventario_id = Column(Integer, ForeignKey("inventario.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    fecha_inicio = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    fecha_fin = Column(TIMESTAMP)
    tarifa_diaria = Column(Numeric(10, 2), nullable=False)
    deposito = Column(Numeric(12, 2), server_default=text("0"))
    dias = Column(Integer)
    total = Column(Numeric(12, 2))
    facturado = Column(Boolean, default=False)
    fecha_facturacion = Column(TIMESTAMP)
    
    # Relationships
    inventario = relationship("Inventario", back_populates="rentas")
    cliente = relationship("Cliente", back_populates="rentas")


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    correo = Column(String(150))
    telefono = Column(String(30))
    numero_alquileres = Column(Integer, default=0)
    estado = Column(String(20), default="activo")
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    rentas = relationship("Renta", back_populates="cliente")
