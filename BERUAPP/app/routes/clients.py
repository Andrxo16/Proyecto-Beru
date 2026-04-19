from fastapi import APIRouter

router = APIRouter(prefix="/clients", tags=["Clients"])

fake_clients = []

@router.post("/")
def create_client(client: dict):
    client["id"] = len(fake_clients) + 1
    fake_clients.append(client)
    return client

@router.get("/")
def get_clients():
    return fake_clients