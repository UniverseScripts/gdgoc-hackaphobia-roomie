from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

#1. Each user has a base model which contains their name and email
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    bio: Optional[str] = None
    profile_completed: bool = False

#2. Password is stored in the DB but not included in the response
class UserStore(UserBase):
    hashed_password: str

#3. Return as part of the response to the user
class UserResponse(UserBase):
    id: str # NoSQL document ID is string
    
    class Config:
        from_attributes = True

#4. Vector stored for similarity algorithms for the test
class UserVectorSchema(BaseModel):
    user_id: str
    responses: Optional[Dict[str, Any]] = None
    vector_data_embeddings: Optional[List[float]] = None
    is_completed: bool = False
    updated_at: Optional[datetime] = None