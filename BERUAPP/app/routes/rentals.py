from fastapi import APIRouter

router = APIRouter(prefix="/rentals", tags=["Rentals"])

fake_rentals = []

@router.post("/")
def create_rental(rental: dict):
    rental["id"] = len(fake_rentals) + 1
    fake_rentals.append(rental)
    return rental

@router.get("/")
def get_rentals():
    return fake_rentals