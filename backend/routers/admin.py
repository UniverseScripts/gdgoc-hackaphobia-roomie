from fastapi import APIRouter, Depends, HTTPException, status
from services.auth import verify_admin_claim
from services.vector_logic import generate_semantic_vector
from core.config import db

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/properties/approve/{property_id}")
def approve_staged_property(property_id: str, current_admin: dict = Depends(verify_admin_claim)):
    """
    Approve a staged property, generate its vector, and atomically move it to the active inventory.
    """
    # Target Acquisition
    staged_ref = db.collection("pending_apartments").document(property_id)
    staged_doc = staged_ref.get()

    if not staged_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Staged property not found."
        )

    # Mathematical Vector Generation
    property_data = staged_doc.to_dict()
    description_text = property_data.get("description")

    if not description_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Data corruption: Missing description text required for vector generation."
        )

    vector_array = generate_semantic_vector(description_text)
    property_data["embedding"] = vector_array
    property_data["status"] = "active"

    # Atomic Batch Execution
    batch = db.batch()
    
    live_ref = db.collection("apartments").document(property_id)
    batch.set(live_ref, property_data)
    batch.delete(staged_ref)
    
    batch.commit()

    return {"message": "Property activated successfully", "id": property_id}
