from pydantic import BaseModel, EmailStr
from typing import List, Optional

#1. Each user has a base model which contains their name and email
class UserBase(BaseModel):
    username: str
    email: EmailStr

#2. Password is stored in the DB but not included in the response
class UserStore(UserBase):
    password: str

#3. Return as part of the response to the user
class UserResponse(UserBase):
    id: int
    
    class Config: #Ensure Docker reads 
        from_attributes = True

#4. Vector stored for similarity algorithms for the test
class VectorUpdate(UserBase):
    vector_sim = List(int)