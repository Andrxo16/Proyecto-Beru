from pydantic import BaseModel


class ClientCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    address: str | None = None


class ClientResponse(ClientCreate):
    id: int

    class Config:
        from_attributes = True
