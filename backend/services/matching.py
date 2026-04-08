import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import UserVector, User
from typing import List, Dict


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


async def get_user_vector(db: AsyncSession, user_id: int) -> UserVector | None:
    """Fetch a user's vector from database."""
    result = await db.execute(
        select(UserVector).where(UserVector.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_candidate_vectors(db: AsyncSession, user_id: int) -> List[tuple[UserVector, User]]:
    """Fetch all completed candidate vectors excluding the current user."""
    result = await db.execute(
        select(UserVector, User)
        .join(User, UserVector.user_id == User.id)
        .where(
            UserVector.user_id != user_id,
            UserVector.is_completed == True
        )
    )
    return result.all()


def calculate_match_score(similarity: float) -> int:
    """Convert similarity score to percentage."""
    return int(max(0, similarity) * 100)


async def find_top_matches(
    current_user_id: int,
    db: AsyncSession,
    limit: int = 10
) -> List[Dict[str, int | str]]:
    """Find top compatible matches for a user based on vector similarity."""
    # Get current user's vector
    user_vector = await get_user_vector(db, current_user_id)

    if not user_vector or not user_vector.vector_data_embeddings:
        return []

    # Get all candidate vectors
    candidates = await get_candidate_vectors(db, current_user_id)

    # Calculate similarity scores
    matches = []
    for vec_row, user_row in candidates:
        if not vec_row.vector_data_embeddings:
            continue

        similarity = calculate_cosine_similarity(
            user_vector.vector_data_embeddings, vec_row.vector_data_embeddings)
        score = calculate_match_score(similarity)

        matches.append({
            "user_id": user_row.id,
            "username": user_row.username,
            "match_score": score
        })

    # Sort by score and return top matches
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:limit]
