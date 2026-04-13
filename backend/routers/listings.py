from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel

from core.config import db
from routers.auth import get_current_user
from services.listing_matching import calculate_listing_score

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
    
    # 2. Fetch All Listings
    for item_doc in db.collection('listings').stream():
        item = item_doc.to_dict()
        item['id'] = item_doc.id
        
        # 3. RUN ALGORITHM
        score = calculate_listing_score(user_prefs, item)
        
        # 4. Fetch Owner Info
        owner_id = item.get('owner_id')
        owner_name = "Unknown"
        owner_img = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg"
        
        if owner_id:
            owner_doc = db.collection('users').document(owner_id).get()
            if owner_doc.exists:
                owner_name = owner_doc.to_dict().get('full_name', 'Unknown')
        
        scored_listings.append({
            "id": item['id'],
            "title": item.get('title'),
            "price": item.get('price'),
            "size": item.get('size'),
            "location": item.get('district'),
            "images": item.get('images', []),
            "fitScore": score, 
            "host": {
                "name": owner_name,
                "image": owner_img,
                "compatibility": score 
            },
            "features": item.get('features', []),
            "description": item.get('description')
        })
    
    scored_listings.sort(key=lambda x: x["fitScore"], reverse=True)
    return scored_listings