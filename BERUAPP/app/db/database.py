from pathlib import Path
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"
ENV_EXAMPLE_PATH = PROJECT_ROOT / ".env.example"

# Prioriza la configuración local del proyecto por encima del entorno global del SO.
# Esto evita conflictos cuando existe una DATABASE_URL global inválida o con codificación problemática.
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=True)
elif ENV_EXAMPLE_PATH.exists():
    load_dotenv(ENV_EXAMPLE_PATH, override=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres2026@127.0.0.1:5432/beru_db",
)

# Conexión a PostgreSQL con codificación UTF-8.
engine = create_engine(
    DATABASE_URL,
    connect_args={"client_encoding": "utf8"},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
