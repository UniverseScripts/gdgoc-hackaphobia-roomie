import sys
import os
from unittest.mock import MagicMock, patch

# Provide mock credentials before anything initializes
os.environ["STORAGE_BUCKET"] = "mock-bucket.appspot.com"
os.environ["SECRET_KEY"] = "mock_secret"
os.environ["ALGORITHM"] = "HS256"
os.environ["FIREBASE_CONFIG"] = "{}"

# Apply deep mocks so the environment accepts our router test
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.auth'] = MagicMock()
sys.modules['firebase_admin.storage'] = MagicMock()
sys.modules['google.cloud.firestore'] = MagicMock()

# Now it is safe to import FAST API dependencies 
from fastapi.testclient import TestClient
from routers.media import router as media_router
from fastapi import FastAPI
from services.auth import verify_firebase_token

app = FastAPI()
app.include_router(media_router, prefix="/api")

client = TestClient(app)

def override_verify_firebase_token():
    return {"uid": "user_123_xyz"}

app.dependency_overrides[verify_firebase_token] = override_verify_firebase_token

def test_media():
    print("Testing Media Cryptographic Signer...")
    
    # Mock the blob storage generator
    mock_bucket = MagicMock()
    mock_bucket.name = "mock-bucket.appspot.com"
    
    mock_blob = MagicMock()
    mock_blob.generate_signed_url.return_value = "https://mock-signed-url.google.com?Signature=123"
    
    mock_bucket.blob.return_value = mock_blob
    
    sys.modules['firebase_admin.storage'].bucket.return_value = mock_bucket

    response = client.get("/api/media/upload-url?content_type=image/jpeg")
    
    if response.status_code != 200:
        print(f"[ERROR] Execution failed: Code {response.status_code}")
        print(response.json())
        sys.exit(1)
        
    data = response.json()
    print(f"Payload received: {data}")
    
    if "final_storage_path" not in data or "user_123_xyz" not in data["final_storage_path"]:
        print("[ERROR] Execution failed: Crypto boundary leak. UID was not explicitly mandated in path.")
        sys.exit(1)
        
    print("[SUCCESS] Media authority successfully executed and signed correctly.")

if __name__ == "__main__":
    test_media()
