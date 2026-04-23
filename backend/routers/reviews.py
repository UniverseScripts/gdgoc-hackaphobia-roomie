from fastapi import APIRouter, Depends, HTTPException
import datetime
from core.config import db
from schemas.reviews import Reviews, ReviewsCreate, ReviewStatus
from services.auth import verify_customer_claim
from services.reviews_calculation import execute_rating_transaction

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/")
def submit_review(payload: ReviewsCreate, current_customer: dict = Depends(verify_customer_claim)):
    target_ref = db.collection("apartments").document(payload.property_id)
    review_ref = db.collection("reviews").document()
    
    review_data = Reviews(
        property_id=payload.property_id,
        author_id=current_customer["uid"],
        stars=payload.stars,
        comment=payload.comment or "",
        created_at=datetime.datetime.now(datetime.timezone.utc),
        status=ReviewStatus.PENDING
    )
    
    transaction = db.transaction()
    new_avg = execute_rating_transaction(transaction, target_ref, review_ref, review_data)
    
    return {"status": "success", "new_average": new_avg, "review_id": review_ref.id}
