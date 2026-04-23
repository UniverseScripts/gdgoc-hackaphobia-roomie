from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Annotated

from starlette import status
from firebase_admin import auth
from core.config import db, settings


security = HTTPBearer()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

async def verify_firebase_token(token: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        authenticate = auth.verify_id_token(token.credentials)
        return authenticate
    except Exception:
        raise credentials_exception

async def verify_landlord_claim(token: dict = Depends(verify_firebase_token)):
    if token.get("role") != "landlord":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient supply-side privileges"
        )
    return token

async def verify_admin_claim(token: dict = Depends(verify_firebase_token)):
    if token.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient administrative privileges"
        )
    return token

async def verify_customer_claim(token: dict = Depends(verify_firebase_token)):
    if token.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient demand-side privileges"
        )
    return token

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