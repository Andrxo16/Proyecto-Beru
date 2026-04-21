from datetime import datetime
from typing import Optional, Union
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator, ConfigDict, field_serializer


class InventarioCreate(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "nombre_equipo": "Excavadora CAT 320",
                "marca": "Caterpillar",
                "modelo": "320 GC",
                "categoria": "Maquinaria",
                "anio": 2024,
                "tarifa_diaria": 450,
                "valor_inicial": 50000
            }
        }
    )
    
    nombre_equipo: str = Field(..., min_length=1, max_length=150, description="Nombre del equipo")
    marca: Optional[str] = Field(None, max_length=100, description="Marca")
    modelo: Optional[str] = Field(None, max_length=100, description="Modelo")
    categoria: Optional[str] = Field(None, max_length=100, description="Categoría")
    anio: Optional[int] = Field(None, ge=1900, description="Año")
    tarifa_diaria: Optional[Union[int, float, Decimal]] = Field(None, ge=0, description="Tarifa diaria")
    valor_inicial: Optional[Union[int, float, Decimal]] = Field(None, ge=0, description="Valor inicial")
    
    @field_validator('tarifa_diaria', 'valor_inicial', mode='before')
    @classmethod
    def convert_numeric(cls, v):
        if v is None or v == '':
            return None
        try:
            # Convertir a Decimal para precisión
            return Decimal(str(v))
        except (ValueError, TypeError):
            raise ValueError(f"Debe ser un número válido")







class InventarioResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        ser_json_timedelta="float"
    )
    
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
    created_at: datetime

    @field_serializer('valor_inicial', 'tarifa_diaria')
    def serialize_decimal(self, value: Optional[Decimal], _info):
        if value is None:
            return None
        return str(value)