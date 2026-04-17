from fastapi import APIRouter, Depends, HTTPException, status
from core.config import db
from schemas.rbac_customer.test import TestSubmission
from services.vector_logic import processing_submissions
from routers.auth import get_current_user
from typing import Annotated

user_dependencies = Annotated[dict, Depends(get_current_user)] 

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/status")
async def check_test_status(user: user_dependencies):
    vector_doc = db.collection('user_vectors').document(user['id']).get()

    if vector_doc.exists and vector_doc.to_dict().get('is_completed') is True:
        return {"completed": True}
    
    return {"completed": False}

@router.post("/submit")
async def submit_assessment(submission: TestSubmission, user: user_dependencies):
    user_vector_ref = db.collection('user_vectors').document(user['id'])
    vector_doc = user_vector_ref.get()

    if vector_doc.exists and vector_doc.to_dict().get('is_completed') is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed the personality assessment."
        )

    raw_data = submission.model_dump()
    math_vector = processing_submissions(raw_data)

    vector_data = {
        "user_id": user['id'],
        "responses": raw_data,
        "vector_data_embeddings": math_vector,
        "is_completed": True
    }

    # Use merge=True so we act like an upsert (create if missing, update if exists)
    user_vector_ref.set(vector_data, merge=True)

    return {"message": "Assessment saved successfully", "vector_generated": math_vector}