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
    doc = db.collection('user_vectors').document(user_id).get()
    return doc.to_dict() if doc.exists else None


def get_candidate_vectors(db, user_id: str) -> List[tuple[dict, dict]]:
    """Fetch all completed candidate vectors excluding the current user."""
    vector_docs = db.collection('user_vectors').where('is_completed', '==', True).stream()
    
    vector_list = []
    user_refs = []
    
    for doc in vector_docs:
        if doc.id == user_id:
             continue
        vector_list.append(doc.to_dict())
        user_refs.append(db.collection('users').document(doc.id))
        
    if not user_refs:
        return []
        
    # Python Firestore SDK get_all expects either varargs or an iterable
    # Expanding with *user_refs ensures compatibility.
    user_snapshots = db.get_all(user_refs)
    
    candidates = []
    # In Python, get_all sometimes returns a generator, so zip is perfectly fine.
    for vec, user_snap in zip(vector_list, user_snapshots):
        if user_snap.exists:
            user_dict = user_snap.to_dict()
            user_dict['id'] = user_snap.id
            candidates.append((vec, user_dict))
            
    return candidates


def calculate_match_score(similarity: float) -> int:
    """Convert similarity score to percentage."""
    return int(max(0, similarity) * 100)


def find_top_matches(
    current_user_id: str,
    db,
    limit: int = 10
) -> List[Dict[str, int | str]]:
    """Find top compatible matches for a user based on vector similarity."""
    # Get current user's vector
    user_vector = get_user_vector(db, current_user_id)

    if not user_vector or not user_vector.get('vector_data_embeddings'):
        return []

    # Get all candidate vectors
    candidates = get_candidate_vectors(db, current_user_id)

    # Calculate similarity scores
    matches = []
    for vec_dict, user_dict in candidates:
        if not vec_dict.get('vector_data_embeddings'):
            continue

        similarity = calculate_cosine_similarity(
            user_vector['vector_data_embeddings'], vec_dict['vector_data_embeddings'])
            
        # SYNTHETIC MONETIZATION VECTOR (ALGORITHMIC BIAS)
        # Artificially inflate the compatibility math for "Premium" profiles
        is_premium_profile = user_dict.get("is_premium", False)
        if is_premium_profile:
            similarity = min(1.0, similarity * 1.15) # 15% Artificial Boost for paying users

        score = calculate_match_score(similarity)

        matches.append({
            "user_id": user_dict['id'],
            "username": user_dict.get('username', 'Unknown'),
            "match_score": score,
            "is_promoted": is_premium_profile
        })

    # Sort by score and return top matches
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:limit]
