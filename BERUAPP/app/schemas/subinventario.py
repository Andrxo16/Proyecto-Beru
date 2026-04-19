from typing import Optional
from pydantic import BaseModel


class SubinventarioCreate(BaseModel):
    inventario_id: int
    nombre_item: str
    cantidad: int = 1
    descripcion: Optional[str] = None


class SubinventarioResponse(SubinventarioCreate):
    id: int

    class Config:
        from_attributes = True