from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from services.auth import verify_admin_claim
from core.config import db
from firebase_admin import auth
from services.auth import verify_firebase_token, SECRET_KEY, ALGORITHM

async def get_current_user(token: dict = Depends(verify_firebase_token)):
    uid = token.get("uid")
    user_doc = db.collection('users').document(uid).get()
    
    # Base user object from token
    user_info = {
        "id": uid,
        "email": token.get("email"),
        "role": token.get("role")
    }

    if user_doc.exists:
        firestore_data = user_doc.to_dict()
        # Merge Firestore data, allowing it to override token role
        # (Firestore is the source of truth for the profile)
        user_info.update(firestore_data)
        user_info["id"] = uid # Ensure id is always set correctly
        
    return user_info

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