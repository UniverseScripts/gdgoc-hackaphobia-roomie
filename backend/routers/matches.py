from pydantic import BaseModel
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from core.config import db
from services.auth import get_current_user, verify_customer_claim
from services.matching import (
    calculate_cosine_similarity, 
    calculate_match_score,
    get_candidate_vectors # You will need to update this service file to query Firestore too!
)

router = APIRouter(prefix="/matches", tags=["Matches"], dependencies=[Depends(verify_customer_claim)])

class MatchProfileSchema(BaseModel):
    user_id: str
    username: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    university: Optional[str] = None
    major: Optional[str] = None
    district: Optional[str] = "Ho Chi Minh City" 
    match_score: int
    avatar_url: str

@router.get("/my-matches", response_model=List[MatchProfileSchema])
async def get_my_matches(current_user: Annotated[dict, Depends(get_current_user)]):
    # Role Enforcement: Ensure only customers access the match engine
    if current_user.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient demand-side privileges"
        )

    uid = current_user['id']
    my_vector_doc = db.collection('test_vectors').document(uid).get()
    
    if not my_vector_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PERSONALITY_TEST_REQUIRED"
        )
        
    my_vector_data = my_vector_doc.to_dict().get('vector_data_embeddings')
    if not my_vector_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PERSONALITY_TEST_REQUIRED"
        )

    # get_candidate_vectors needs to be rewritten in matching.py to return lists of dicts from Firestore
    candidates = get_candidate_vectors(db, current_user['id'])
    
    matches = []
    
    for candidate_vector, candidate_user in candidates:
        candidate_embeddings = candidate_vector.get('vector_data_embeddings')
        if not candidate_embeddings:
            continue

        similarity = calculate_cosine_similarity(my_vector_data, candidate_embeddings)
        real_score = calculate_match_score(similarity)

        district = "Ho Chi Minh City"
        if candidate_vector.get('responses'):
             district = candidate_vector['responses'].get('district', district)

        images = candidate_user.get('images', [])
        avatar = images[0] if images else "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg"

        matches.append({
            "user_id": candidate_user['id'],
            "username": candidate_user.get('username'),
            "full_name": candidate_user.get('full_name') or candidate_user.get('username'),
            "age": candidate_user.get('age') or 20,
            "university": candidate_user.get('university') or "University",
            "major": candidate_user.get('major') or "Student",
            "district": district,
            "match_score": real_score, 
            "avatar_url": avatar
        })
        
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches