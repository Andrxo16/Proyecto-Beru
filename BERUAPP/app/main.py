from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
import app.db.equipment  # noqa: F401 — registra modelos en Base.metadata
from app.routes import equipment, clients, rentals


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)
print("Clients route file:", getattr(clients, "__file__", "unknown"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego lo restringimos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipment.router)
app.include_router(clients.router)
app.include_router(rentals.router)

@app.get("/")
def root():
    return {"message": "ERP Backend funcionando"}