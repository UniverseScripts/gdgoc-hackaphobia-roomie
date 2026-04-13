from fastapi import APIRouter, HTTPException, status
from typing import List
from firebase_admin import firestore

from core.config import db
from schemas.market import MarketSearchQuery
from services.vector_logic import generate_semantic_vector
from services.matching import calculate_cosine_similarity

router = APIRouter(prefix="/market", tags=["Market"])

@router.post("/search", status_code=status.HTTP_200_OK)
async def search_market(payload: MarketSearchQuery):
    """
    High-performance, cost-clamped discovery endpoint.
    Filters out properties using NoSQL logic before applying a semantic rank calculation.
    """
    # Phase 2: Macroscopic Clamping
    query = db.collection("apartments")
    
    if payload.housing_type:
        query = query.where("type", "==", payload.housing_type)
        
    if payload.location_adm2:
        query = query.where("location.adm2", "==", payload.location_adm2)
        
    if payload.max_budget:
        query = query.where("price", "<=", payload.max_budget)
        
    # Fail-safe limit prevents memory exhaustion
    query = query.limit(200)
    apartments_docs = query.get()
    
    results = []
    
    # Phase 3 & 4: Semantic Scan and Sort
    if payload.semantic_query:
        query_vector = generate_semantic_vector(payload.semantic_query)
        
        for apt in apartments_docs:
            data = apt.to_dict()
            data['id'] = apt.id
            
            # Fetch document embedding
            doc_vector = data.get("embedding", [])
            
            # If a property has no embeddings, give it a default score.
            score = 0.0
            if doc_vector:
                score = calculate_cosine_similarity(query_vector, doc_vector)
                
            data["similarity_score"] = score
            results.append(data)
            
        # Sort descending by score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
    else:
        # If no semantic query, just return raw data
        for apt in apartments_docs:
            data = apt.to_dict()
            data['id'] = apt.id
            results.append(data)
            
    # Slice first 20 items to tightly enforce maximum return limit
    final_payload = results[:20]
    
    return {"data": final_payload}

@router.get("", status_code=status.HTTP_200_OK)
async def get_market():
    """
    Retrieve an array of apartments directly from Firestore.
    Limit tightly enforced to 50 items.
    """
    apartments_ref = db.collection("apartments").limit(50)
    apartments = apartments_ref.get()
    
    result = []
    for apt in apartments:
        data = apt.to_dict()
        data['id'] = apt.id
        result.append(data)
        
    return {"data": result}


@router.get("/{type}/{id}", status_code=status.HTTP_200_OK)
async def get_market_item(type: str, id: str):
    """
    Retrieve specific document by ID and housing type.
    """
    doc_ref = db.collection("apartments").document(id).get()

    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset_data = doc_ref.to_dict()

    # In-memory evaluation bypasses query engine overhead
    if asset_data.get("type") != type:
        raise HTTPException(status_code=400, detail="Asset type mismatch")

    return asset_data
