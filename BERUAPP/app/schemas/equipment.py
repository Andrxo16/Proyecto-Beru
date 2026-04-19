from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InventarioCreate(BaseModel):
    nombre_equipo: str
    ubicacion: Optional[str] = None
    historia_uso: Optional[str] = None
    valor_inicial: Optional[float] = None
    estado: str = "disponible"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    categoria: Optional[str] = None
    anio: Optional[int] = None
    tarifa_diaria: Optional[float] = None


class InventarioResponse(InventarioCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True