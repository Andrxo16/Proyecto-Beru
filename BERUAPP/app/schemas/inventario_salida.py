from datetime import datetime
from pydantic import BaseModel, Field


class InventarioSalidaCreate(BaseModel):
    nombre_material: str
    precio: float
    unidades_vendidas: int = 0
    fecha_venta: datetime = Field(default_factory=datetime.now)


class InventarioSalidaResponse(InventarioSalidaCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True