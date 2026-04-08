from pydantic import BaseModel
from typing import Optional

class ProfileCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    university: str
    major: str
    bio: Optional[str] = None