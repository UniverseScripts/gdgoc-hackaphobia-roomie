from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    university: Optional[str] = None
    profile_completed: bool = False

class UserStore(UserBase):
    hashed_password: str

class UserResponse(UserBase):
    id: str

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
