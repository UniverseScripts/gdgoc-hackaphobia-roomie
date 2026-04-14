from pydantic import BaseModel, Field

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
    clicks: int = 0
    impressions: int = 0
