from datetime import datetime, timezone, timedelta
import jwt
from fastapi import APIRouter, HTTPException, status, Depends
from core.config import db, settings
from services.auth import verify_customer_claim
from schemas.customer import SponsorRequest

router = APIRouter(prefix="/sponsor", tags=["Sponsor"], dependencies=[Depends(verify_customer_claim)])

@router.post("/request/{id}", status_code=status.HTTP_201_CREATED)
async def create_sponsor_request(id: str, payload: SponsorRequest):
    """
    Ingest user sponsorship forms.
    """
    doc_ref = db.collection("sponsors").document(id)
    doc_data = payload.model_dump()
    doc_data["status"] = "pending"
    doc_ref.set(doc_data)
    
    return {"message": "Sponsorship created successfully", "id": id, "data": doc_data}


@router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_sponsor(id: str):
    """
    Retrieve active sponsor document for user.
    """
    doc_ref = db.collection("sponsors").document(id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sponsor document not found")
        
    return {"id": id, "data": doc.to_dict()}


@router.get("/url/create/{id}", status_code=status.HTTP_200_OK)
async def create_sponsor_url(id: str):
    """
    Cryptographic deep-link generator using JWT.
    """
    # Expiration set for 24 hours to prevent replay attacks
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)
    
    payload = {
        "sponsor_id": id,
        "exp": expiration
    }
    
    # Sign token with application's secret key
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    # Constructing hypothetical frontend domain redirect
    frontend_domain = "https://roomie.gdgoc.example.com/sponsor-redeem"
    url = f"{frontend_domain}?token={token}"
    
    return {"id": id, "url": url}
