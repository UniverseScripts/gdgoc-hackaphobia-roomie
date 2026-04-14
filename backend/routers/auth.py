from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from services.auth import verify_admin_claim
from core.config import db
from firebase_admin import auth

router = APIRouter(prefix="/auth", tags=['auth'])

# Ensure this router is protected by verify_admin_claim
@router.post("/set-role")
def assign_user_role(target_uid: str, target_role: str, current_user: dict = Depends(verify_admin_claim)):
    # 1. Validate against the Enum
    if target_role not in ["customer", "landlord", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role assignment")

    try:
        # 2. Cryptographic Law (JWT Custom Claim)
        auth.set_custom_user_claims(target_uid, {'role': target_role})
        
        # 3. Frontend Hydration State (Firestore Read-Only Projection)
        db.collection('users').document(target_uid).update({'role': target_role})
        
        return {"status": "success", "message": f"Role {target_role} granted to {target_uid}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))