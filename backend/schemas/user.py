from enum import Enum
from pydantic import BaseModel, EmailStr
from typing import  Optional

class Role(Enum):
    CUSTOMER = "customer"
    LANDLORD = "landlord"
    ADMIN = "admin"


class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    profile_completed: bool = False
    role: Role

class CustomerUserStore(UserBase):
    university: Optional[str] = None

class LandlordUserStore(UserBase):
    business_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    email: str