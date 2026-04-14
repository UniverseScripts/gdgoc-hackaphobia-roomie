from pydantic import BaseModel, Field
from typing import Optional

class LeaseRequest(BaseModel):
    property_id: str
    monthly_rent: float = Field(..., gt=0)
    deposit_amount: float = Field(..., ge=0)
    status: str = "pending"

class AdsRequest(BaseModel):
    property_id: str
    target_audience: str
    budget: float = Field(..., gt=0)
    duration_days: int = Field(..., gt=0)
    status: str = "active"
