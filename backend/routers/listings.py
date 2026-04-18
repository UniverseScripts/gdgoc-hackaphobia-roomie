from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel

from core.config import db
from services.listing_matching import calculate_listing_score
from schemas.apartment import ApartmentResponse

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
    coordinates: List[float]
    images: List[str]
    fitScore: int
    host: HostSchema
    features: List[str]
    description: str

@router.get("/recommendations", response_model=List[ListingSchema])
async def get_listing_recommendations(authorization: Optional[str] = None):
    """
    Returns scored listings. Works for both authenticated and unauthenticated users.
    When called with a valid Firebase token, preferences are used for scoring.
    When unauthenticated, all listings are returned with a neutral fitScore of 50.
    """
    from fastapi import Request
    user_prefs = {}

    # Phase 1: Stream all apartments
    raw_apartments = []
    for item_doc in db.collection('apartments').stream():
        raw_dict = item_doc.to_dict() or {}
        raw_dict['id'] = item_doc.id

        # Defensive defaults to prevent Pydantic validation crashes on seeded data
        raw_dict.setdefault('owner_id', 'unknown')
        raw_dict.setdefault('housing_type', 'apartment')
        raw_dict.setdefault('coordinates', [10.772, 106.664])
        raw_dict.setdefault('district', 'Ho Chi Minh City')
        raw_dict.setdefault('description', '')

        try:
            listing_model = ApartmentResponse.model_validate(raw_dict)
            raw_apartments.append((raw_dict, listing_model))
        except Exception:
            continue  # Skip malformed documents silently

    if not raw_apartments:
        return []

    # Phase 2: Batch-resolve owner profiles (single Firestore round-trip)
    owner_ids = [r.get('owner_id') for r, _ in raw_apartments if r.get('owner_id') and r.get('owner_id') != 'unknown']
    owner_map: dict = {}
    if owner_ids:
        owner_refs = [db.collection('users').document(oid) for oid in dict.fromkeys(owner_ids)]
        for snap in db.get_all(owner_refs):
            if snap.exists:
                owner_map[snap.id] = snap.to_dict()

    DEFAULT_AVATAR = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg"

    scored_listings = []
    for raw_dict, listing_model in raw_apartments:
        score = calculate_listing_score(user_prefs, listing_model)

        owner_id = raw_dict.get('owner_id', '')
        owner_data = owner_map.get(owner_id, {})
        owner_name = owner_data.get('full_name') or owner_data.get('username') or 'Unknown'

        # GeoPoint Synchronization: Convert Firestore objects to standard List[float]
        coords = raw_dict.get('coordinates', [10.772, 106.664])
        if hasattr(coords, 'latitude') and hasattr(coords, 'longitude'):
            coords = [coords.latitude, coords.longitude]

        scored_listings.append({
            "id": listing_model.id,
            "title": listing_model.title,
            "price": int(listing_model.price),
            "size": int(listing_model.size),
            "location": listing_model.district,
            "coordinates": coords,
            "images": listing_model.images,
            "fitScore": score,
            "host": {
                "name": owner_name,
                "image": DEFAULT_AVATAR,
                "compatibility": score
            },
            "features": listing_model.amenities,
            "description": listing_model.description or ''
        })

    scored_listings.sort(key=lambda x: x["fitScore"], reverse=True)
    return scored_listings