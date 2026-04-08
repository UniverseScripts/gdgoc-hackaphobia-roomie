from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db
from models.listing import Listing
from models.user import User, UserVector
from routers.auth import get_current_user
from services.listing_matching import calculate_listing_score

router = APIRouter(prefix="/listings", tags=["Listings"])

# --- SCHEMA ---
class HostSchema(BaseModel):
    name: str
    image: str
    compatibility: int

class ListingSchema(BaseModel):
    id: int
    title: str
    price: int
    size: int
    location: str
    images: List[str]
    fitScore: int
    host: HostSchema
    features: List[str]
    description: str

@router.get("/recommendations", response_model=List[ListingSchema])
async def get_listing_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch User's Preferences
    result = await db.execute(select(UserVector).where(UserVector.user_id == current_user.id))
    user_vector = result.scalar_one_or_none()
    user_prefs = user_vector.responses if user_vector else {}
    
    # 2. Fetch All Listings
    l_result = await db.execute(select(Listing))
    all_listings = l_result.scalars().all()
    
    scored_listings = []
    
    for item in all_listings:
        # 3. RUN ALGORITHM
        score = calculate_listing_score(user_prefs, item)
        
        # 4. Fetch Owner Info
        owner_res = await db.execute(select(User).where(User.id == item.owner_id))
        owner = owner_res.scalar_one_or_none()
        
        owner_name = owner.full_name if owner else "Unknown"
        owner_img = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg" # Default
        
        scored_listings.append({
            "id": item.id,
            "title": item.title,
            "price": item.price,
            "size": item.size,
            "location": item.district,
            "images": item.images,
            "fitScore": score, # <--- The AI Score
            "host": {
                "name": owner_name,
                "image": owner_img,
                "compatibility": score # Host compatibility usually correlates with listing fit
            },
            "features": item.features,
            "description": item.description
        })
    
    # 5. Sort by Best Match
    scored_listings.sort(key=lambda x: x["fitScore"], reverse=True)
    
    return scored_listings
