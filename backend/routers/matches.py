from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db
from models.user import User, UserVector
from routers.auth import get_current_user

from services.matching import (
    calculate_cosine_similarity, 
    calculate_match_score,
    get_candidate_vectors
)


router = APIRouter(prefix="/matches", tags=["Matches"])

# --- UPDATED SCHEMA (Real Data) ---
class MatchProfileSchema(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    university: Optional[str] = None
    major: Optional[str] = None
    district: Optional[str] = "Ho Chi Minh City" # Default fallback
    match_score: int
    avatar_url: str 

@router.get("/my-matches", response_model=List[MatchProfileSchema])
async def get_my_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Get Current User's Vector
    result = await db.execute(select(UserVector).where(UserVector.user_id == current_user.id))
    my_vector_row = result.scalar_one_or_none()
    
    # If I haven't taken the test, I can't be matched
    if not my_vector_row or not my_vector_row.vector_data_embeddings:
        return []

    my_vector_data = my_vector_row.vector_data_embeddings

    # 2. Get All Candidates (Optimized Fetch from matching.py)
    # This returns a list of tuples: [(UserVector, User), ...]
    candidates = await get_candidate_vectors(db, current_user.id)
    
    matches = []
    
    for user_vector, user in candidates:
        # Safety Check: Skip if candidate has no vector data
        if not user_vector.vector_data_embeddings:
            continue

        # --- 3. APPLY THE ALGORITHM ---
        similarity = calculate_cosine_similarity(
            my_vector_data, 
            user_vector.vector_data_embeddings
        )
        real_score = calculate_match_score(similarity)

        # 4. Get Metadata (District)
        district = "Ho Chi Minh City"
        if user_vector.responses:
             district = user_vector.responses.get('district', district)

        # 5. Build Profile Object
        avatar = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg"

        matches.append({
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name or user.username,
            "age": user.age or 20,
            "university": user.university or "University",
            "major": user.major or "Student",
            "district": district,
            "match_score": real_score, # <--- The calculated score
            "avatar_url": avatar
        })
        
    # 6. Sort by Highest Match Score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return matches