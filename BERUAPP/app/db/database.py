from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Change to temp directory to avoid path issues
os.chdir(r"c:\temp")

# Database URL with connect_args to avoid Unicode issues
engine = create_engine(
    "postgresql+psycopg2://postgrest:pgadmin@127.0.0.1:5432/beru_db",
    connect_args={'client_encoding': 'utf8'}
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
