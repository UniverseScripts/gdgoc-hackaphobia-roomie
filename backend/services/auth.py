from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Annotated
from pydantic import Ann
from starlette import status
from firebase_admin import auth
from core.config import settings


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