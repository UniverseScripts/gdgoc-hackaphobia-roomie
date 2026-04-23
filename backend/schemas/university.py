from pydantic import BaseModel

class University(BaseModel):
    id: int
    user_id: str
    name: str
    coordinates: tuple[float, float]