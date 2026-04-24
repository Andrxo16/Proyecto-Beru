from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class EquipmentCreate(BaseModel):
    nombre_equipo: str
    ubicacion: Optional[str] = None
    historia_uso: Optional[str] = None
    valor_inicial: Optional[Decimal] = None
    estado: str = "disponible"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    categoria: Optional[str] = None
    anio: Optional[int] = None
    tarifa_diaria: Optional[Decimal] = None


class EquipmentResponse(BaseModel):
    id: int
    nombre_equipo: str
    ubicacion: Optional[str] = None
    historia_uso: Optional[str] = None
    valor_inicial: Optional[Decimal] = None
    estado: str
    marca: Optional[str] = None
    modelo: Optional[str] = None
    categoria: Optional[str] = None
    anio: Optional[int] = None
    tarifa_diaria: Optional[Decimal] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubinventoryCreate(BaseModel):
    nombre_item: str
    cantidad: int = 1
    descripcion: Optional[str] = None


class SubinventoryResponse(BaseModel):
    id: int
    inventario_id: int
    nombre_item: str
    cantidad: int
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


class RentalCreate(BaseModel):
    inventario_id: int
    cliente_id: Optional[int] = None
    fecha_inicio: date
    fecha_fin: date
    deposito: Optional[Decimal] = None
    cliente: Optional[str] = None
    ubicacion: Optional[str] = None


class RentalResponse(BaseModel):
    id: int
    inventario_id: int
    cliente_id: Optional[int] = None
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    tarifa_diaria: Decimal
    deposito: Optional[Decimal] = None
    dias: Optional[int] = None
    total: Optional[Decimal] = None
    estado: str
    facturado: bool = False
    cliente: Optional[str] = None
    equipo_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class ClientCreate(BaseModel):
    nombre: str
    correo: Optional[str] = None
    telefono: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    nombre: str
    correo: Optional[str] = None
    telefono: Optional[str] = None
    numero_alquileres: int = 0
    estado: str = "activo"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True