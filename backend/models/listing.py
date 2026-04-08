from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from core.database import Base

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, nullable=False)
    price = Column(Integer, nullable=False) # In VND
    size = Column(Integer, nullable=False)  # In m2
    district = Column(String, nullable=False) # e.g., "District 1"
    
    # Store images/features as JSON lists
    images = Column(JSON, default=[]) 
    features = Column(JSON, default=[])
    description = Column(Text, nullable=True)
    
    # Relationship
    owner = relationship("User", back_populates="listings")