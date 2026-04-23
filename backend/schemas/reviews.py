from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import Field, BaseModel

class ReviewStatus(str, Enum):
    PUBLISHED = "published"
    PENDING = "pending"
    REJECTED = "rejected"

class Reviews(BaseModel):
    property_id: str
    author_id: str
    stars: int = Field(..., ge=1, le=5)
    comment: str
    created_at: Optional[datetime] = None
    status: Optional[ReviewStatus] = ReviewStatus.PENDING

class ReviewsCreate(BaseModel):
    property_id: str
    stars: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None