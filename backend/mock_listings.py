import asyncio
import sys
import os

# Ensure we can import from folders like 'routers' and 'models'
sys.path.append(os.getcwd())

from sqlalchemy import select
from core.database import AsyncLocalSession, engine, Base
from models.listing import Listing
from models.user import User

# 🟢 FIX: Import the hash tool from your existing auth.py
from routers.auth import bycrypt_context 

# --- MOCK DATA ---
LISTINGS_DATA = [
    {
        "title": "Sunlit Studio in District 1",
        "price": 8500000, 
        "size": 35,
        "district": "District 1",
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
        "features": ["Air Conditioning", "WiFi", "Balcony"],
        "description": "A beautiful sunlit studio perfect for students."
    },
    {
        "title": "Modern 2-Bedroom Condo",
        "price": 15000000,
        "size": 75,
        "district": "District 2",
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
        "features": ["Gym", "Pool", "Parking"],
        "description": "Luxury living with gym and pool access."
    },
    {
        "title": "Cozy Loft near RMIT",
        "price": 9500000,
        "size": 45,
        "district": "District 7",
        "images": ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"],
        "features": ["High Ceilings", "Smart TV"],
        "description": "Stylish loft apartment with high ceilings."
    },
    {
        "title": "Student Shared Room",
        "price": 4000000,
        "size": 25,
        "district": "Binh Thanh",
        "images": ["https://images.unsplash.com/photo-1593696140829-c38b56919eb3?w=800&q=80"],
        "features": ["Shared Kitchen", "Utilities Included"],
        "description": "Shared room in a friendly student house."
    },
    {
        "title": "Minimalist Apartment",
        "price": 11000000,
        "size": 50,
        "district": "District 3",
        "images": ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80"],
        "features": ["Pet Friendly", "Elevator"],
        "description": "Quiet area, newly renovated."
    }
]

async def seed():
    print("🌱 Starting Seed Process...")

    # 1. Create Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncLocalSession() as db:
        # 2. Create Dummy Host
        result = await db.execute(select(User).where(User.username == "host_user"))
        host = result.scalars().first()

        if not host:
            print("👤 Creating dummy host user...")
            
            # 🟢 FIX: Use the hash feature from auth.py
            hashed_pw = bycrypt_context.hash("password123")
            
            host = User(
                username="host_user",
                email="host@fitnest.com",
                hashed_password=hashed_pw, # <--- Used here
                full_name="FitNest Host",
                age=30,
                gender="Male",
                university="N/A",
                major="Property Manager",
            )
            db.add(host)
            await db.commit()
            await db.refresh(host)
        
        print(f"✅ Using Host ID: {host.id}")

        # 3. Insert Listings
        print(f"📦 Inserting {len(LISTINGS_DATA)} listings...")
        
        for item in LISTINGS_DATA:
            # Check for duplicates
            existing = await db.execute(select(Listing).where(Listing.title == item["title"]))
            if existing.scalars().first():
                continue

            listing = Listing(
                owner_id=host.id,
                **item
            )
            db.add(listing)
        
        await db.commit()
        print("🎉 Listings inserted successfully!")

if __name__ == "__main__":
    asyncio.run(seed())