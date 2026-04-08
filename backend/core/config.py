from pydantic_settings import BaseSettings
from firebase_admin import initialize_app


class Settings(BaseSettings):
    # These will now be read from .env (locally) or docker-compose (production)
    FIREBASE_CONFIG: list

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

app = initialize_app(options=settings.FIREBASE_CONFIG)