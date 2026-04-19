from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class RentaCreate(BaseModel):
    inventario_id: int
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    tarifa_diaria: float
    dias: Optional[int] = None
    total: Optional[float] = None


class RentaResponse(RentaCreate):
    id: int

    class Config:
        from_attributes = True
