from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import equipment, clients, rentals, subinventario, inventario_salida

app = FastAPI()

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
app.include_router(subinventario.router)
app.include_router(inventario_salida.router)

@app.get("/")
def root():
    return {"message": "ERP Backend funcionando"}