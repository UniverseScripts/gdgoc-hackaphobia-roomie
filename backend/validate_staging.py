import sys
import os
from unittest.mock import MagicMock

# Inject environment overrides BEFORE importing the app
os.environ["SECRET_KEY"] = "mock_secret"
os.environ["ALGORITHM"] = "HS256"
os.environ["FIREBASE_CONFIG"] = "{}"

# Mock Firebase entirely via sys.modules
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.auth'] = MagicMock()
sys.modules['firebase_admin.firestore'] = MagicMock()
sys.modules['google.cloud.firestore'] = MagicMock()

# Now it is safe to import main and any internal dependencies
from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers.landlord import router as landlord_router
from services.auth import verify_landlord_claim
from core.config import db

app = FastAPI()
app.include_router(landlord_router, prefix="/api")

client = TestClient(app)

def override_verify_landlord_claim():
    return {"uid": "mocked_landlord_uid_777", "role": "landlord"}

app.dependency_overrides[verify_landlord_claim] = override_verify_landlord_claim

payload = {
    "title": "Beautiful Loft",
    "description": "This is a very nice loft with 20 chars at least to pass validation.",
    "housing_type": "loft",
    "price": 1000.0,
    "size": 50.5,
    "district": "District 1"
}

# Provide auto-id behavior
mock_doc = MagicMock()
mock_doc.id = "mocked_doc_id_999"
db.collection.return_value.document.return_value = mock_doc

print("Running test against POST /api/landlord/properties/stage")
response = client.post("/api/landlord/properties/stage", json=payload)

print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.json()}")

if response.status_code == 201:
    print("[SUCCESS] Execution verification succeeded. Payload injected correctly.")
else:
    print("[ERROR] Execution verification failed.")
    sys.exit(1)
