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

class UserVectorUpdate(BaseModel):
    # Lightweight explicit model for updating a user's vector
    vector_data_embeddings: List[float]
    is_completed: bool = True
    updated_at: Optional[datetime] = None

class UserVectorSchema(BaseModel):
    user_id: str
    responses: Optional[Dict[str, Any]] = None
    vector_data_embeddings: Optional[List[float]] = None
    is_completed: bool = False
    updated_at: Optional[datetime] = None
