from schemas.apartment import ApartmentCreate, ApartmentResponse
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

def create_listing(db, listing_data: ApartmentCreate, owner_id: str) -> dict:
    """
    Creates a new listing linked to the logged-in user.
    """
    doc_data = listing_data.model_dump()
    doc_data['owner_id'] = owner_id
    doc_data['created_at'] = datetime.now(timezone.utc)
    
    _time, doc_ref = db.collection('apartments').add(doc_data)
    doc_data['id'] = doc_ref.id
    return doc_data


def get_all_listings(db, cursor_id: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
    """
    Fetches all listings with optional cursor pagination.
    """
    query = db.collection('apartments').order_by('created_at')
    
    if cursor_id:
        cursor_doc = db.collection('apartments').document(cursor_id).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)
            
    query = query.limit(limit)
    docs = query.stream()
    
    result = []
    last_doc_id = None
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        result.append(data)
        last_doc_id = doc.id
        
    return {
        "data": result,
        "next_cursor": last_doc_id
    }


def get_listings_by_location(db, location: str) -> list:
    """
    Fetches specific listings filtered by location string (mapped to district).
    """
    query = db.collection('apartments').where('district', '==', location)
    docs = query.stream()
    result = []
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        result.append(data)
    return result


def delete_listing(db, listing_id: str, owner_id: str) -> bool:
    """
    Deletes a listing ONLY if the owner_id matches.
    Returns True if deleted, False if not found or unauthorized.
    """
    doc_ref = db.collection('apartments').document(listing_id)
    doc = doc_ref.get()

    if not doc.exists:
        return False
        
    if doc.to_dict().get('owner_id') != owner_id:
        return False

    doc_ref.delete()
    return True
