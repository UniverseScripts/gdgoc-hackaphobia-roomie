from fastapi import HTTPException
from google.cloud import firestore

@firestore.transactional
def execute_rating_transaction(transaction, target_ref, review_ref, review_data):
    snapshot = target_ref.get(transaction=transaction)
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Target property annihilated or missing.")
    
    current_data = snapshot.to_dict()
    old_total = current_data.get("total_comments", 0)
    old_avg = current_data.get("average_stars", 0.0)
    
    # Mathematical aggregation
    new_total = old_total + 1
    new_avg = ((old_avg * old_total) + review_data["stars"]) / new_total
    
    # Dual-write execution
    transaction.set(review_ref, review_data)
    transaction.update(target_ref, {
        "total_comments": new_total,
        "average_stars": round(new_avg, 2)
    })
    return round(new_avg, 2)