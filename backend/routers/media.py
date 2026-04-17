from fastapi import APIRouter, Depends, HTTPException
from services.auth import verify_firebase_token
from firebase_admin import storage
import datetime
import uuid

router = APIRouter(prefix="/media", tags=["media"])

@router.get("/upload-url")
def generate_signed_upload_url(content_type: str, current_user: dict = Depends(verify_firebase_token)):
    """
    Mints a 15-minute cryptographically signed URL for direct-to-bucket client uploads.
    """
    if content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid binary signature.")
        
    # Isolate user media in their own directory path to prevent overwrites
    file_extension = content_type.split("/")[1]
    blob_path = f"users/{current_user['uid']}/{uuid.uuid4()}.{file_extension}"
    
    bucket = storage.bucket()
    blob = bucket.blob(blob_path)
    
    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),
        method="PUT",
        content_type=content_type
    )
    
    return {
        "upload_url": url,
        "final_storage_path": f"https://storage.googleapis.com/{bucket.name}/{blob_path}"
    }
