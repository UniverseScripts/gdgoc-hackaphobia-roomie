import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password@localhost/fitnest" # Fallback for local dev
)

# 1 Create the engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# 2 Create a local session connection
AsyncLocalSession = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# 3 Create a Base class
Base = declarative_base()

# 4 Create a command to get database
async def get_db():
    async with AsyncLocalSession() as session:
        try:
            yield session
        finally:
            await session.close()

# 5 Initiate the table in main.py
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
