from pydantic import BaseModel
from typing import List, Optional

class ApartmentBase(BaseModel):
    owner_id: str
    title: str
    housing_type: str
    price: float
    coordinates: List[float]
    description: str
    size: float
    district: str
    address: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []
    embedding: Optional[List[float]] = None
    availability: bool = True

class ApartmentCreate(ApartmentBase):
    pass

class ApartmentResponse(ApartmentBase):
    id: str
