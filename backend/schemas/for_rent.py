from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class ListingBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    size: int = Field(..., gt=0)
    district: str
    features: Dict[str, bool] = {} # e.g. {"wifi": true}
    images: List[str] = []

class ListingCreate(ListingBase):
    pass

class ListingResponse(ListingBase):
    id: str  # NoSQL document ID is string
    owner_id: str
    created_at: datetime

    class Config:
        from_attributes = True