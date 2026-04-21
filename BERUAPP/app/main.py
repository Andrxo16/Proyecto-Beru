from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import equipment, clients, rentals, subinventario, inventario_salida
from app.db.base import Base
from app.db.session import engine
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear tablas automáticamente
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Tablas de base de datos creadas exitosamente")
except Exception as e:
    logger.error(f"Error al crear tablas: {str(e)}")

app = FastAPI(title="RentaEquip API", description="Sistema ERP para gestión de alquileres")

# CORS middleware DEBE estar primero
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(equipment.router)
app.include_router(clients.router)
app.include_router(rentals.router)
app.include_router(subinventario.router)
app.include_router(inventario_salida.router)

@app.get("/")
def root():
    return {"message": "ERP Backend funcionando"}