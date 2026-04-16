from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class LeaseRequest(BaseModel):
    property_id: str
    monthly_rent: float = Field(..., gt=0)
    deposit_amount: float = Field(..., ge=0)
    available_from: datetime
    terms_accepted: bool = False
    status: str = "pending"

class AdsRequest(BaseModel):
    property_id: str
    target_audience: str
    budget: float = Field(..., gt=0)
    duration_days: int = Field(..., gt=0)
    status: str = "active"

class PendingApartmentCreate(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)
    housing_type: str
    price: float = Field(..., gt=0)
    size: float = Field(..., gt=0)
    district: str
    address: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []

class PendingApartmentResponse(PendingApartmentCreate):
    id: str
    owner_id: str
    status: str = "pending_review"
