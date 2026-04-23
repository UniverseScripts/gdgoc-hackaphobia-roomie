from fastapi import APIRouter, HTTPException
from firebase_admin import auth

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/{uid}", response_model=str)
async def get_username(uid: str):
    try:
        user = auth.get_user(uid)
        return user.display_name
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))