from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated

from core.database import get_db
from models.user import User, UserVector
from routers.auth import get_current_user
from schemas.onboarding import ProfileCreate

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

# --- 1. SUBMIT PROFILE FORM ---
@router.post("/profile")
async def update_profile(
    data: ProfileCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    # Update fields
    current_user.full_name = data.full_name
    current_user.age = data.age
    current_user.gender = data.gender
    current_user.university = data.university
    current_user.major = data.major
    current_user.bio = data.bio
    current_user.profile_completed = True # Mark Step 1 as done
    
    await db.commit()
    return {"message": "Profile updated successfully"}

# --- 2. GET PROFILE ENDPOINT ---
@router.get("/profile")
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Returns the full profile details for the currently logged-in user.
    """
    return {
        "username": current_user.username,
        "full_name": current_user.full_name,
        "age": current_user.age,
        "university": current_user.university,
        "major": current_user.major,
        "bio": current_user.bio,
        "gender": current_user.gender
    }
    
# --- 3. MASTER STATUS CHECK ---
@router.get("/status")
async def get_onboarding_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Checks exactly where the user is in the pipeline.
    """
    # Check Test Status
    result = await db.execute(select(UserVector).where(UserVector.user_id == current_user.id))
    vector = result.scalar_one_or_none()
    test_done = vector.is_completed if vector else False
    
    return {
        "profile_completed": current_user.profile_completed,
        "test_completed": test_done                          
    }