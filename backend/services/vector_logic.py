from typing import List, Dict

# --- 1. SLEEP SCHEDULE ---
SLEEP_MAP = {
    "Very early (before 10h)": 0.0,
    "Some-what early (10–11h)": 0.25,
    "Average (11–12h)": 0.5,
    "Midnight (12–1am)": 0.75,
    "Very late (Sleep after 1am)": 1.0
}

# --- 2. CLEANLINESS ---
CLEANLINESS_MAP = {
    "Very messy as long as there’s a place to rest": 0.0,
    "A bit messy": 0.25,
    "Normal": 0.5,
    "Somewhat clean": 0.75,
    "I stay very clean and hygienic. Cannot stand dirtiness": 1.0
}

# --- 3. NOISE TOLERANCE ---
NOISE_MAP = {
    "Immediately stay silent": 0.0,
    "Willing to lower your volume if pointed out": 0.33,
    "Hard to adapt": 0.66,
    "Genuinely do not give a damn": 1.0
}

# --- 4. GUEST FREQUENCY ---
GUEST_MAP = {
    "Hate it": 0.0,
    "Hardly": 0.33,
    "Only when notified in advance": 0.66,
    "Open-minded": 1.0
}

# --- 5. BUDGET ---
BUDGET_MAP = {
    "Under 1.5mil VND": 0.0,
    "1.5-2mil VND": 0.33,
    "2-3mil VND": 0.66,
    "Over 3mil VND": 1.0
}

# --- 6. PRIORITY ---
PRIORITY_MAP = {
    "Cheap": 0.0,
    "Near school/workplace": 0.25,
    "Convenience": 0.5,
    "Security": 0.75,
    "Peaceful": 1.0
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
    vector.append(SLEEP_MAP.get(data.get("sleep_schedule", ""), 0.5))
    vector.append(CLEANLINESS_MAP.get(data.get("cleanliness", ""), 0.5))
    vector.append(NOISE_MAP.get(data.get("noise_tolerance", ""), 0.5))
    vector.append(GUEST_MAP.get(data.get("guest_frequency",""), 0.5))
    vector.append(BUDGET_MAP.get(data.get("budget", ""), 0.5))
    vector.append(PRIORITY_MAP.get(data.get("priority", ""), 0.5))
    vector.append(DISTRICT_MAP.get(data.get("district", ""), 0.0))
    
    return vector