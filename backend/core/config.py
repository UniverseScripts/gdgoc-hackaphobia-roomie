from pydantic_settings import BaseSettings
from firebase_admin import initialize_app, firestore
from dotenv import load_dotenv
import json
import os

# Explicitly hydrate os.environ so google-auth detects the path.
load_dotenv(".env")


class Settings(BaseSettings):
    # These will now be read from .env (locally) or docker-compose (production)
    FIREBASE_CONFIG: str
    STORAGE_BUCKET: str = "gdgoc-hackaphobia-roomie.appspot.com"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

try:
    firebase_cred_dict = json.loads(settings.FIREBASE_CONFIG)
except json.JSONDecodeError as e:
    raise ValueError(f"CRITICAL INFRASTRUCTURE FAILURE: FIREBASE_CONFIG is not a valid JSON string. Parse Error: {e}")

# DIRECTIVE: Cryptographic Identity Binding
cred = credentials.Certificate(firebase_cred_dict)

options = {}
if settings.STORAGE_BUCKET:
    options["storageBucket"] = settings.STORAGE_BUCKET

# DIRECTIVE: Strict Initialization
app = initialize_app(cred, options=options)
db = firestore.client()