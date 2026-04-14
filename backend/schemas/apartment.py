from pydantic import BaseModel
from typing import List, Optional

class ApartmentBase(BaseModel):
    owner_id: str
    title: str
    housing_type: str
    price: float
    size: float
    district: str
    images: List[str] = []
    amenities: List[str] = []
    embedding: Optional[List[float]] = None

class ApartmentCreate(ApartmentBase):
    pass

class ApartmentResponse(ApartmentBase):
    id: str
