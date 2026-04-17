from fastapi import APIRouter, Depends, HTTPException
from core.config import db
from services.auth import verify_customer_claim
from schemas.market import ReviewCreate
from google.cloud import firestore
import datetime

router = APIRouter(prefix="/reviews", tags=["reviews"])

@firestore.transactional
def execute_rating_transaction(transaction, target_ref, review_ref, review_data):
    snapshot = target_ref.get(transaction=transaction)
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Target property annihilated or missing.")
    
    current_data = snapshot.to_dict()
    old_total = current_data.get("total_reviews", 0)
    old_avg = current_data.get("average_rating", 0.0)
    
    # Mathematical aggregation
    new_total = old_total + 1
    new_avg = ((old_avg * old_total) + review_data["stars"]) / new_total
    
    # Dual-write execution
    transaction.set(review_ref, review_data)
    transaction.update(target_ref, {
        "total_reviews": new_total,
        "average_rating": round(new_avg, 2)
    })
    return round(new_avg, 2)

@router.post("/")
def submit_review(payload: ReviewCreate, current_customer: dict = Depends(verify_customer_claim)):
    target_ref = db.collection("apartments").document(payload.property_id)
    review_ref = db.collection("reviews").document()
    
    review_data = {
        "id": review_ref.id,
        "property_id": payload.property_id,
        "author_id": current_customer["uid"],
        "stars": payload.stars,
        "comment": payload.comment or "",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "status": "published"
    }
    
    transaction = db.transaction()
    new_avg = execute_rating_transaction(transaction, target_ref, review_ref, review_data)
    
    return {"status": "success", "new_average": new_avg, "review_id": review_ref.id}
