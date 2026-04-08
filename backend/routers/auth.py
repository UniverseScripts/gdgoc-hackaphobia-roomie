from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.user import User
from starlette import status
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from core.config import settings

router = APIRouter(prefix="/auth", tags=['auth'])

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

bycrypt_context = CryptContext(schemes=['bcrypt'])
OAuth2Bearer = OAuth2PasswordBearer(tokenUrl="auth/token")


class CreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


db_dependencies = Annotated[AsyncSession, Depends(get_db)]


async def authenticate_user(db: db_dependencies, username: str, password: str):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        return False
    # Bcrypt max password length is 72 bytes - truncate at byte level, not character level
    password_bytes = password.encode('utf-8')[:72]
    password_truncated = password_bytes.decode('utf-8', errors='ignore')
    if not bycrypt_context.verify(password_truncated, str(user.hashed_password)):
        return False
    return user


async def create_access_token(username: str, user_id: int, expires_data: timedelta | None = None):
    to_encode = {'sub': username, 'id': user_id}
    if expires_data:
        expire = datetime.now(timezone.utc) + expires_data
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=1)
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, key=SECRET_KEY, algorithm=ALGORITHM)
    return encoded


async def get_current_user(token: Annotated[str, Depends(OAuth2Bearer)], db: db_dependencies):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                          detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        token_decode = jwt.decode(
            token=token, key=SECRET_KEY, algorithms=ALGORITHM)
        user_id = token_decode.get('id')
        if user_id is None:
            raise credentials_exception
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_user(db: db_dependencies, create_user_request: CreateUserRequest):
    # Bcrypt max password length is 72 bytes - truncate at byte level, not character level
    password_bytes = create_user_request.password.encode('utf-8')[:72]
    password_truncated = password_bytes.decode('utf-8', errors='ignore')
    create_user_model = User(username=create_user_request.username,
                             email=create_user_request.email,
                             hashed_password=bycrypt_context.hash(password_truncated))
    db.add(create_user_model)
    await db.commit()
    await db.refresh(create_user_model)
    return {"id": create_user_model.id, "username": create_user_model.username, "email": create_user_model.email}


@router.post("/token")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependencies
):
    """
    OAuth2 compatible token endpoint.
    UPDATED: Now returns user_id and username alongside the token.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Extract values
    username_val = user.username if not isinstance(user.username, str) else user.username
    user_id_val = user.id if not isinstance(user.id, int) else user.id
    
    access_token = await create_access_token(username_val, user_id_val)
    
    # Return extra fields so the frontend can store them
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user_id_val,
        "username": username_val
    }

@router.get("/user/{user_id}")
async def get_public_profile(
    user_id: int, 
    db: db_dependencies, 
):
    """
    Get public info (username) of another user by their ID.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": user.id, "username": user.username}
