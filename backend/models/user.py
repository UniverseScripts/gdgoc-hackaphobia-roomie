from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    university = Column(String, nullable=True)
    major = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    profile_completed = Column(Boolean, default=False) 
    
    # Relationships
    vector = relationship("UserVector", back_populates="user", uselist=False)
    listings = relationship("Listing", back_populates="owner")

class UserVector(Base):
    __tablename__="user_vectors"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    responses = Column(JSONB, nullable=True)
    
    vector_data_embeddings = Column(JSONB, nullable=True)
    
    is_completed = Column(Boolean, default=False)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="vector")