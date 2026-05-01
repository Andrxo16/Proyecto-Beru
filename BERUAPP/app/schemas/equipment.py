from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


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
    direccion: Optional[str] = None
    nit_documento: Optional[str] = None
    celular: Optional[str] = None
    ciudad: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    nombre: str
    correo: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    nit_documento: Optional[str] = None
    celular: Optional[str] = None
    ciudad: Optional[str] = None
    numero_alquileres: int = 0
    estado: str = "activo"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserPermissions(BaseModel):
    can_dashboard: bool = False
    can_inventory: bool = False
    can_warehouse: bool = False
    can_clients: bool = False
    can_rentals: bool = False
    can_permissions: bool = False
    can_inventory_show_id: bool = True
    can_inventory_show_tarifa: bool = True


class UserCreate(BaseModel):
    username: str
    password: str
    activo: bool = True
    permissions: UserPermissions = Field(default_factory=UserPermissions)


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdatePermissions(BaseModel):
    activo: bool
    permissions: UserPermissions


class UserResponse(BaseModel):
    id: int
    username: str
    activo: bool = True
    permissions: UserPermissions
    created_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse