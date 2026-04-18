import numpy as np
from typing import List, Dict, Optional

def calculate_cosine_similarity(vector1: list, vector2: list) -> float:
    """Calculate cosine similarity between two vectors."""
    if not vector1 or not vector2:
        return 0.0

    v1 = np.array(vector1)
    v2 = np.array(vector2)

    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    # Safety check for division by zero
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    return float(np.dot(v1, v2) / (norm_v1 * norm_v2))


def get_user_vector(db, user_id: str) -> Optional[dict]:
    """Fetch a user's vector from database."""
    doc = db.collection('test_vectors').document(user_id).get()
    return doc.to_dict() if doc.exists else None


def get_candidate_vectors(db, user_id: str) -> List[tuple[dict, dict]]:
    """Fetch all completed candidate vectors excluding the current user."""
    vector_docs = db.collection('test_vectors').where('is_completed', '==', True).stream()
    
    vector_list = []
    user_refs = []
    
    for doc in vector_docs:
        if doc.id == user_id:
            continue
        vec = doc.to_dict()
        vec['_doc_id'] = doc.id  # Preserve doc ID for safe dict-keyed lookup
        vector_list.append(vec)
        user_refs.append(db.collection('users').document(doc.id))
        
    if not user_refs:
        return []
        
    # get_all does NOT guarantee order — use a dict keyed by document ID (Bug 2 fix)
    user_snapshots = db.get_all(user_refs)
    user_map = {snap.id: snap for snap in user_snapshots if snap.exists}
    
    candidates = []
    for vec in vector_list:
        doc_id = vec.get('_doc_id')
        if doc_id in user_map:
            user_snap = user_map[doc_id]
            user_dict = user_snap.to_dict()
            user_dict['id'] = user_snap.id
            candidates.append((vec, user_dict))
            
    return candidates


def calculate_match_score(similarity: float) -> int:
    """Convert similarity score to percentage."""
    return int(max(0, similarity) * 100)
