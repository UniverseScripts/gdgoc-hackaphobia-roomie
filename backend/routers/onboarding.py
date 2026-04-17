from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Annotated, Union

from core.config import db
from routers.auth import get_current_user
from schemas.user import CustomerUserStore, LandlordUserStore

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

@router.post("/profile")
async def update_profile(
    data: Annotated[Union[CustomerUserStore, LandlordUserStore], Body(discriminator='role')],
    current_user: Annotated[dict, Depends(get_current_user)]
):
    user_ref = db.collection('users').document(current_user['id'])
    
    update_data = data.model_dump(exclude_unset=True)
    update_data["profile_completed"] = True
    
    user_ref.set(update_data, merge=True)
    return {"message": "Profile updated successfully"}

@router.get("/profile")
async def get_profile(current_user: Annotated[dict, Depends(get_current_user)]):
    return {
        "username": current_user.get('username'),
        "full_name": current_user.get('full_name'),
        "age": current_user.get('age'),
        "university": current_user.get('university'),
        "major": current_user.get('major'),
        "bio": current_user.get('bio'),
        "gender": current_user.get('gender'),
        "business_id": current_user.get('business_id'),
        "business_name": current_user.get('business_name')
    }
    
@router.get("/status")
async def get_onboarding_status(
    current_user: Annotated[dict, Depends(get_current_user)]
):
    vector_doc = db.collection('user_vectors').document(current_user['id']).get()
    test_done = False
    
    if vector_doc.exists:
        test_done = vector_doc.to_dict().get('is_completed', False)
    
    return {
        "profile_completed": current_user.get('profile_completed', False),
        "test_completed": test_done                          
    }