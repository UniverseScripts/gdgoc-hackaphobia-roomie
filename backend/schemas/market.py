from pydantic import BaseModel
from typing import Optional

class MarketSearchQuery(BaseModel):
    location_adm2: Optional[str] = None
    housing_type: Optional[str] = None
    max_budget: Optional[int] = None
    semantic_query: Optional[str] = None
