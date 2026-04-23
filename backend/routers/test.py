from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from core.config import db
from services.vector_logic import processing_submissions
from services.auth import get_current_user, verify_customer_claim
from schemas.customer import TestSubmission, TestVectorSchema

router = APIRouter(prefix="/test", tags=["Test"], dependencies=[Depends(verify_customer_claim)])

@router.get("/status")
async def check_test_status(user: Annotated[dict, Depends(get_current_user)]):
    uid = user['id']
    vector_doc = db.collection('test_vectors').document(uid).get()

    if vector_doc.exists and vector_doc.to_dict().get('is_completed') is True:
        return {"completed": True}
    
    return {"completed": False}

@router.post("/submit")
async def submit_assessment(submission: TestSubmission, user: Annotated[dict, Depends(get_current_user)]):
    uid = user['id']
    user_vector_ref = db.collection('test_vectors').document(uid)
    vector_doc = user_vector_ref.get()

    if vector_doc.exists and vector_doc.to_dict().get('is_completed') is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed the personality assessment."
        )

    raw_data = submission.model_dump()
    math_vector = processing_submissions(raw_data)

    vector_data = TestVectorSchema(
        user_id=user['id'],
        responses=raw_data,
        vector_data_embeddings=math_vector,
        is_completed=True
    )

    user_vector_ref.set(vector_data, merge=True)

    return {"message": "Assessment saved successfully", "vector_generated": math_vector}