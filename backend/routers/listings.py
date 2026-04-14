from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel

from core.config import db
from routers.auth import get_current_user
from services.listing_matching import calculate_listing_score
from schemas.for_rent import ListingResponse

router = APIRouter(prefix="/listings", tags=["Listings"])

class HostSchema(BaseModel):
    name: str
    image: str
    compatibility: int

class ListingSchema(BaseModel):
    id: str
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
async def get_listing_recommendations(current_user: dict = Depends(get_current_user)):
    # 1. Fetch User's Preferences
    vector_doc = db.collection('user_vectors').document(current_user['id']).get()
    user_prefs = vector_doc.to_dict().get('responses', {}) if vector_doc.exists else {}
    
    scored_listings = []
    
    # 2. Fetch All Listings (Target collection is 'apartments')
    for item_doc in db.collection('apartments').stream():
        raw_dict = item_doc.to_dict()
        raw_dict['id'] = item_doc.id
        
        # We might need to ensure missing fields don't break strict pydantic validation if db is dirty
        if 'owner_id' not in raw_dict:
            raw_dict['owner_id'] = 'unknown'
        if 'created_at' not in raw_dict:
            # mock for pydantic
            from datetime import datetime, timezone
            raw_dict['created_at'] = datetime.now(timezone.utc)
            
        listing_model = ListingResponse.model_validate(raw_dict)
        
        # 3. RUN ALGORITHM
        score = calculate_listing_score(user_prefs, listing_model)
        
        # 4. Fetch Owner Info
        owner_id = raw_dict.get('owner_id')
        owner_name = "Unknown"
        owner_img = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg"
        
        if owner_id and owner_id != 'unknown':
            owner_doc = db.collection('users').document(owner_id).get()
            if owner_doc.exists:
                owner_name = owner_doc.to_dict().get('full_name', 'Unknown')
        
        scored_listings.append({
            "id": listing_model.id,
            "title": listing_model.title,
            "price": listing_model.price,
            "size": listing_model.size,
            "location": listing_model.district,
            "images": listing_model.images,
            "fitScore": score, 
            "host": {
                "name": owner_name,
                "image": owner_img,
                "compatibility": score 
            },
            "features": list(listing_model.features.keys()), # if features evaluates to list of strings
            "description": listing_model.description or ''
        })
    
    scored_listings.sort(key=lambda x: x["fitScore"], reverse=True)
    return scored_listings