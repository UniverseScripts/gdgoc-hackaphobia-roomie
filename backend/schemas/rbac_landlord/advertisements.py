from pydantic import BaseModel, Field

class AdsRequest(BaseModel):
    property_id: str
    target_audience: str
    budget: float = Field(..., gt=0)
    duration_days: int = Field(..., gt=0)
    status: str = "active"
    clicks: int = 0
    impressions: int = 0