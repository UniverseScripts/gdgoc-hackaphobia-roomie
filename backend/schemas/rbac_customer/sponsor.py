from pydantic import BaseModel, Field
from typing import Optional

class SponsorRequest(BaseModel):
    sponsor_name: str
    target_audience: str
    budget: float = Field(..., gt=0)
    campaign_duration_days: int = Field(..., gt=0)
    status: str = "pending"
