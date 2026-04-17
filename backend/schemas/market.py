from pydantic import BaseModel, Field
from typing import Optional

class MarketSearchQuery(BaseModel):
    location_adm2: Optional[str] = None
    housing_type: Optional[str] = None
    max_budget: Optional[float] = None
    semantic_query: Optional[str] = None

class Ratings(BaseModel):
    stars: int = Field(..., ge=1, le=5)
    review: str

class ReviewCreate(BaseModel):
    property_id: str
    stars: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None