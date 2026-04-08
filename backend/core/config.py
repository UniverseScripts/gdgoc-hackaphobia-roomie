from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database Settings
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # These will now be read from .env (locally) or docker-compose (production)
    SECRET_KEY: str
    ALGORITHM: str = "HS256" # Default to HS256 if not specified

    @property
    def DATABASE_URL(self) -> str:
        from urllib.parse import quote_plus
        user = quote_plus(self.POSTGRES_USER)
        password = quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql+asyncpg://{user}:{password}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
