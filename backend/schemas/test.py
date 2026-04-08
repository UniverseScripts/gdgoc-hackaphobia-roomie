from pydantic import BaseModel, Field, field_validator


class TestSubmission(BaseModel):
    sleep_schedule: str
    cleanliness: str
    noise_tolerance: str
    guest_frequency: str
    budget: str
    priority: str
    district: str = Field(title="How far would you prefer your stay to be from the centre of the city? (District 1)",
                          description="Select any of the districts on HCMC")

    @field_validator('district')
    @classmethod
    def validate_district(cls, v):
        allowed = ["District 1", "District 3", "District 4",
                   "Binh Thanh", "District 5", "District 7", "Thu Duc"]
        if v not in allowed:
            raise ValueError(f"Answer must be one of the {allowed}.")
        return v
