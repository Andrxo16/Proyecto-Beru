from fastapi import APIRouter
from app.schemas.equipment import EquipmentCreate

router = APIRouter(prefix="/equipment", tags=["Equipment"])

# 🔥 Base de datos simulada
fake_db = []

@router.post("/")
def create_equipment(equipment: EquipmentCreate):
    new_equipment = equipment.dict()
    new_equipment["id"] = len(fake_db) + 1
    fake_db.append(new_equipment)
    return new_equipment

@router.get("/")
def get_equipment():
    return fake_db