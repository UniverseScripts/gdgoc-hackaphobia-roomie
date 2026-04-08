from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from models.user import User, UserVector
from schemas.test import TestSubmission
from services.vector_logic import processing_submissions
from routers.auth import get_current_user
from typing import Annotated

# Inititate user and database dependencies.
user_dependencies = Annotated[User, Depends(get_current_user)] 
db_dependencies = Annotated[AsyncSession, Depends(get_db)]

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/status")
async def check_test_status(
    user: user_dependencies,
    db: db_dependencies
):
    """
    Frontend calls this to decide:
    - If True -> Hide the test button 
    - If False -> Show 'Start Assessment' 
    """
    # Query the vector table for this user
    result = await db.execute(select(UserVector).where(UserVector.user_id == user.id))
    vector_entry = result.scalar_one_or_none()

    if vector_entry is not None and vector_entry.is_completed is True:
        return {"completed": True}
    
    return {"completed": False}

@router.post("/submit")
async def submit_assessment(
    submission: TestSubmission,
    user: user_dependencies,
    db: db_dependencies
):
    """
    Receives user answers, converts to Vector, and saves to DB.
    """
    # 1. Check if already done (Double enforcement) 
    result = await db.execute(select(UserVector).where(UserVector.user_id == user.id))
    user_vector = result.scalar_one_or_none()

    if user_vector is not None and user_vector.is_completed is True:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed the personality assessment."
        )

    # 2. Process Logic (The 'AI' Part)
    # Convert Pydantic model to dict, then to Vector [cite: 47]
    raw_data = submission.model_dump()
    math_vector = processing_submissions(raw_data)

    # 3. Create or Update the Record
    if not user_vector:
        # If row doesn't exist yet, create it
        user_vector = UserVector(user_id=user.id)
        db.add(user_vector)
        await db.flush()

    # Update columns
    setattr(user_vector, 'responses', raw_data)
    setattr(user_vector, 'vector_data_embeddings', math_vector)
    setattr(user_vector, 'is_completed', True) 

    # 4. Commit to Database
    await db.commit()
    await db.refresh(user_vector)

    return {"message": "Assessment saved successfully", "vector_generated": math_vector}