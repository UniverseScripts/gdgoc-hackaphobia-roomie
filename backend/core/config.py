from pydantic_settings import BaseSettings
from firebase_admin import initialize_app, firestore
from dotenv import load_dotenv
import os

# Explicitly hydrate os.environ so google-auth detects the path.
load_dotenv(".env")


class Settings(BaseSettings):
    # These will now be read from .env (locally) or docker-compose (production)
    FIREBASE_CONFIG: dict
    STORAGE_BUCKET: str = "gdgoc-hackaphobia-roomie.appspot.com"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

options = settings.FIREBASE_CONFIG.copy()
if settings.STORAGE_BUCKET:
    options["storageBucket"] = settings.STORAGE_BUCKET

app = initialize_app(options=options)
db = firestore.client()