from pydantic import BaseModel, Field

class LeaseRequest(BaseModel):
    property_id: str
    monthly_rent: float = Field(..., gt=0)
    deposit_amount: float = Field(..., ge=0)
    available_from: datetime
    terms_accepted: bool = False
    status: str = "pending"