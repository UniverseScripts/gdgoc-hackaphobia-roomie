import sys
from unittest.mock import MagicMock

import os
os.environ["FIREBASE_CONFIG"] = "{}"

sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.auth'] = MagicMock()
sys.modules['firebase_admin.storage'] = MagicMock()
sys.modules['google.cloud.firestore'] = MagicMock()
sys.modules['google.cloud.firestore'].transactional = lambda f: f

# Mock Firestore classes
class MockSnapshot:
    def __init__(self, exists, data=None):
        self._exists = exists
        self._data = data or {}
    
    @property
    def exists(self):
        return self._exists
        
    def to_dict(self):
        return self._data

class MockTransaction:
    def __init__(self):
        self.set_calls = []
        self.update_calls = []
        
    def set(self, ref, data):
        self.set_calls.append((ref, data))
        
    def update(self, ref, data):
        self.update_calls.append((ref, data))

# Mock target ref
class MockRef:
    def __init__(self, snapshot):
        self.snapshot = snapshot
        
    def get(self, transaction):
        return self.snapshot

# Import logic from our implementation
# Instead of doing massive mock injections for the entire app, we just test the math logic
from routers.reviews import execute_rating_transaction

def test_aggregation():
    print("Testing Rating Aggregator...")
    # Scenario: Target property currently has an average of 4.0 across 2 reviews.
    # New review is a 5-star rating.
    # Math: ((4.0 * 2) + 5) / 3 = 13 / 3 = 4.3333 -> 4.33
    
    init_data = {"total_reviews": 2, "average_rating": 4.0}
    snapshot = MockSnapshot(exists=True, data=init_data)
    
    target_ref = MockRef(snapshot)
    review_ref = MagicMock()
    review_data = {"stars": 5}
    
    transaction = MockTransaction()
    
    # Execute the function
    new_avg = execute_rating_transaction(transaction, target_ref, review_ref, review_data)
    
    expected_avg = 4.33
    if new_avg != expected_avg:
        print(f"[ERROR] Execution failed: expected {expected_avg}, got {new_avg}")
        sys.exit(1)
        
    # Check dual-write updates
    updates = transaction.update_calls[0][1]
    if updates["total_reviews"] != 3 or updates["average_rating"] != expected_avg:
        print("[ERROR] Execution failed: Transaction update body incorrect.")
        print(f"Updates payload: {updates}")
        sys.exit(1)

    print("[SUCCESS] Rating aggregation math and strict dual-write logic executed correctly!")

if __name__ == "__main__":
    test_aggregation()
