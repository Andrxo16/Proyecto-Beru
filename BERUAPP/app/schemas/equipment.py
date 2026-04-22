from datetime import datetime
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