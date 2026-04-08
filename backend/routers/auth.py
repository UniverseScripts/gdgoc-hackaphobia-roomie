from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from services.auth import verify_firebase_token
from core.config import app
from firebase_admin import auth

router = APIRouter(prefix="/auth", tags=['auth'])

@router.post('/set-role', status_code=status.HTTP_200_OK)
async def assign_user_role(uid: str, role: str, current_user: dict = Depends(verify_firebase_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient clearance.")
    try:
        auth.set_custom_user_claims(uid=uid, custom_claims={'role': role}, app=app)
        return {"status": "success", "message": f"role {role} assigned to {uid}"}
    except auth.UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not registered.")