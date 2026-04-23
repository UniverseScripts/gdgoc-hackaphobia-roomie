from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional
from datetime import datetime

class TestSubmission(BaseModel):
    sleep_schedule: str
    cleanliness: str
    noise_tolerance: str
    guest_frequency: str
    budget: str
    priority: str
    district: str = Field(title="How far would you prefer your stay to be from the centre of the city? (District 1)",
                          description="Select any of the districts on HCMC")

    @field_validator('district')
    @classmethod
    def validate_district(cls, v):
        allowed = ["District 1", "District 3", "District 4",
                   "Binh Thanh", "District 5", "District 7", "Thu Duc"]
        if v not in allowed:
            raise ValueError(f"Answer must be one of the {allowed}.")
        return v

class TestVectorUpdate(BaseModel):
    vector_data_embeddings: List[float]
    is_completed: bool = True
    updated_at: Optional[datetime] = None

class TestVectorSchema(BaseModel):
    user_id: str
    responses: Dict[str, Any]
    vector_data_embeddings: list[float]
    is_completed: bool = False
    updated_at: Optional[datetime] = None

class SponsorRequest(BaseModel):
    sponsor_name: str
    target_audience: str
    budget: float = Field(..., gt=0)
    campaign_duration_days: int = Field(..., gt=0)
    status: str = "pending"