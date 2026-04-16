from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any

from core.config import db
from services.auth import verify_landlord_claim
from schemas.landlord import LeaseRequest, AdsRequest, PendingApartmentCreate, PendingApartmentResponse

router = APIRouter(prefix="/landlord", tags=["Landlord"])

@router.post("/lease/request/{id}", status_code=status.HTTP_201_CREATED)
async def create_lease_request(id: str, payload: LeaseRequest, claim: dict = Depends(verify_landlord_claim)):
    """
    Ingest a lease application configured by the landlord.
    """
    doc_ref = db.collection("lease_requests").document(id)
    doc_data = payload.model_dump()
    doc_ref.set(doc_data)
    
    return {"message": "Lease request created successfully", "id": id, "data": doc_data}


@router.post("/ads/request/{id}", status_code=status.HTTP_201_CREATED)
async def create_ad_request(id: str, payload: AdsRequest, claim: dict = Depends(verify_landlord_claim)):
    """
    Ingest an advertisement promotion request.
    """
    doc_ref = db.collection("advertisements").document(id)
    doc_data = payload.model_dump()
    doc_ref.set(doc_data)
    
    return {"message": "Ad request created successfully", "id": id, "data": doc_data}


@router.get("/ads/{id}/analytics", status_code=status.HTTP_200_OK)
async def get_ad_analytics(id: str):
    """
    Retrieve advertisement performance metrics (clicks, views) from Firestore.
    """
    doc_ref = db.collection("advertisements").document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advertisement not found")
        
    data = doc.to_dict()
    
    # Extract telemetry metrics, safely defaulting to 0 if missing.
    analytics = {
        "clicks": data.get("clicks", 0),
        "impressions": data.get("impressions", 0)
    }
    
    return {"id": id, "analytics": analytics}

@router.post("/properties/stage", response_model=PendingApartmentResponse, status_code=status.HTTP_201_CREATED)
def stage_property(payload: PendingApartmentCreate, current_landlord: dict = Depends(verify_landlord_claim)):
    """
    Secure staging endpoint for landlord property submissions.
    """
    document_data = payload.model_dump()
    
    # State Injection: Forcibly append cryptographic and application state
    document_data["owner_id"] = current_landlord.get("uid")
    document_data["status"] = "pending_review"
    
    # Target isolation collection, prevent direct write to main inventory
    doc_ref = db.collection("pending_apartments").document()
    document_data["id"] = doc_ref.id
    
    doc_ref.set(document_data)
    
    return document_data
