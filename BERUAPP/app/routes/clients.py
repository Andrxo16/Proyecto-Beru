from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Creating client: {client}")
        data = client.model_dump(exclude_none=False)
        db_client = Client(**data)
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        logger.info(f"Client created with ID: {db_client.id}")
        return db_client
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating client: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/", response_model=List[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    try:
        logger.info("Fetching all clients")
        return db.query(Client).all()
    except Exception as e:
        logger.error(f"Error fetching clients: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{client_id}", response_model=ClientResponse)
def get_client_by_id(client_id: int, db: Session = Depends(get_db)):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching client: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_data: ClientCreate, db: Session = Depends(get_db)):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        for key, value in client_data.model_dump().items():
            setattr(client, key, value)
        db.commit()
        db.refresh(client)
        logger.info(f"Client {client_id} updated successfully")
        return client
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating client: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        db.delete(client)
        db.commit()
        logger.info(f"Client {client_id} deleted successfully")
        return {"message": "Client deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting client: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")