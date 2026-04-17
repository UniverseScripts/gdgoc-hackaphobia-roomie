from enum import Enum
from pydantic import BaseModel
from typing import Optional, Literal

class Role(str, Enum):
    CUSTOMER = "customer"
    LANDLORD = "landlord"
    ADMIN = "admin"

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    profile_completed: bool = False

class CustomerUserStore(UserBase):
    role: Literal[Role.CUSTOMER] = Role.CUSTOMER
    university: str
    major: Optional[str] = None
    bio: Optional[str] = None

class LandlordUserStore(UserBase):
    role: Literal[Role.LANDLORD] = Role.LANDLORD
    business_id: str
    business_name: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: Role
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    profile_completed: bool = False
    
    university: Optional[str] = None
    major: Optional[str] = None
    business_id: Optional[str] = None
    business_name: Optional[str] = None
    bio: Optional[str] = None