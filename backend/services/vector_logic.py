from typing import List, Dict
import functools
from vertexai.language_models import TextEmbeddingModel

# Initialize the embedding model
embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")

@functools.lru_cache(maxsize=128)
def generate_semantic_vector(text: str) -> List[float]:
    """
    Generate dense vectors from a natural language query via Vertex AI.
    Cached explicitly to prevent redundant identical calls.
    """
    embeddings = embedding_model.get_embeddings([text])
    return embeddings[0].values

# --- 1. SLEEP SCHEDULE ---
SLEEP_TENSOR_MAP = {
    "sleep_very_early": 0.0,
    "sleep_early": 0.25,
    "sleep_normal": 0.5,
    "sleep_late": 0.75,
    "sleep_very_late": 1.0
}

# --- 2. CLEANLINESS ---
CLEANLINESS_TENSOR_MAP = {
    "clean_messy": 0.0,
    "clean_somewhat_messy": 0.25,
    "clean_normal": 0.5,
    "clean_somewhat_clean": 0.75,
    "clean_very_clean": 1.0
}

# --- 3. NOISE TOLERANCE ---
NOISE_TENSOR_MAP = {
    "noise_silent": 0.0,
    "noise_moderate": 0.33,
    "noise_high": 0.66,
    "noise_any": 1.0
}

# --- 4. GUEST FREQUENCY ---
GUEST_TENSOR_MAP = {
    "guest_hate": 0.0,
    "guest_hardly": 0.33,
    "guest_notify": 0.66,
    "guest_open": 1.0
}

# --- 5. BUDGET NORMALIZATION ---
def normalize_budget(budget_str: str) -> float:
    try:
        # Expected format: "1500000-4000000"
        bounds = budget_str.split("-")
        b_min = float(bounds[0])
        b_max = float(bounds[1])
        
        mean_budget = (b_min + b_max) / 2.0
        
        # Absolute bounds: 0 to 10,000,000 VND
        normalized = mean_budget / 10000000.0
        return max(0.0, min(1.0, normalized))
    except (ValueError, IndexError):
        # Fallback to absolute median on pipeline failure
        return 0.5 

# --- 6. PRIORITY ---
PRIORITY_TENSOR_MAP = {
    "priority_cheap": 0.0,
    "priority_location": 0.25,
    "priority_convenience": 0.5,
    "priority_security": 0.75,
    "priority_peaceful": 1.0
}

# --- 7. DISTRICT ---
DISTRICT_MAP = {
    "District 1": 0.0,
    "District 3": 0.1,
    "District 4": 0.2,
    "District 5": 0.3,
    "Binh Thanh": 0.4,
    "District 7": 0.6,
    "Thu Duc": 0.8,
}

def processing_submissions(data: Dict) -> List[float]:
    vector = []
    
    # Safely get values with defaults in case of missing data
    vector.append(SLEEP_TENSOR_MAP.get(data.get("sleep_schedule", ""), 0.5))
    vector.append(CLEANLINESS_TENSOR_MAP.get(data.get("cleanliness", ""), 0.5))
    vector.append(NOISE_TENSOR_MAP.get(data.get("noise_tolerance", ""), 0.5))
    vector.append(GUEST_TENSOR_MAP.get(data.get("guest_frequency",""), 0.5))
    vector.append(normalize_budget(str(data.get("budget", ""))))
    vector.append(PRIORITY_TENSOR_MAP.get(data.get("priority", ""), 0.5))
    vector.append(DISTRICT_MAP.get(data.get("district", ""), 0.0))
    
    return vector