from typing import Dict
from models.listing import Listing

# --- 1. REUSE THE MAPS FROM VECTOR_LOGIC ---
DISTRICT_MAP = {
    "District 1": 0.0,
    "District 3": 0.1,
    "District 4": 0.2,
    "District 5": 0.3,
    "Binh Thanh": 0.4,
    "District 7": 0.6,
    "Thu Duc": 0.8,
}

# --- 2. DEFINE PRICE BUCKETS (To match user's "Budget" choice) ---
def normalize_listing_price(price: int) -> float:
    """Maps a raw price (VND) to the 0-1 scale used in the questionnaire."""
    if price < 1500000: return 0.0     # "Under 1.5mil"
    if price < 2000000: return 0.33    # "1.5-2mil"
    if price < 3000000: return 0.66    # "2-3mil"
    return 1.0                         # "Over 3mil"

def normalize_user_budget(budget_answer: str) -> float:
    """Maps the user's text answer to the 0-1 scale."""
    if "Under" in budget_answer: return 0.0
    if "1.5-2mil" in budget_answer: return 0.33
    if "2-3mil" in budget_answer: return 0.66
    return 1.0

# --- 3. THE ALGORITHM ---
def calculate_listing_score(user_prefs: Dict, listing: Listing) -> int:
    """
    Calculates a 0-100 Match Score based purely on Location & Price.
    """
    if not user_prefs: return 50 # Default if no data
    
    # --- A. LOCATION SCORE (50% Weight) ---
    user_district = user_prefs.get('district', 'District 1')
    listing_district = listing.district
    
    # Get vector positions
    user_loc_val = DISTRICT_MAP.get(user_district, 0.0)
    list_loc_val = DISTRICT_MAP.get(listing_district, 0.5)
    
    # Calculate closeness (1.0 is far, 0.0 is same)
    loc_distance = abs(user_loc_val - list_loc_val)
    # Convert to score (Closer = Higher)
    loc_score = max(0, 1.0 - loc_distance) * 100

    # --- B. PRICE SCORE (50% Weight) ---
    user_budget_str = user_prefs.get('budget', 'Under 1.5mil VND')
    
    user_price_val = normalize_user_budget(user_budget_str)
    list_price_val = normalize_listing_price(listing.price)
    
    price_distance = abs(user_price_val - list_price_val)
    price_score = max(0, 1.0 - price_distance) * 100
    
    # --- FINAL WEIGHTED AVERAGE ---
    # You can adjust weights here (e.g., Price might be more important)
    final_score = (loc_score * 0.5) + (price_score * 0.5)
    
    return int(final_score)