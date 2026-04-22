from pydantic import BaseModel

class EquipmentCreate(BaseModel):
    name: str
    status: str
    daily_price: float

class EquipmentResponse(EquipmentCreate):
    id: int

    class Config:
        from_attributes = True