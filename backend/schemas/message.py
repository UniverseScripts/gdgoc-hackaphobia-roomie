from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class MessageBase(BaseModel):
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str  # NoSQL document ID is string
    
    model_config = ConfigDict(from_attributes=True)
