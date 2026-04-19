from datetime import datetime
from pydantic import BaseModel


class InventarioSalidaCreate(BaseModel):
    nombre_material: str
    precio: float
    unidades_vendidas: int = 0
    fecha_venta: datetime


class InventarioSalidaResponse(InventarioSalidaCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True