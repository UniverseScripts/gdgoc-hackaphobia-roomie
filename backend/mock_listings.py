import os
import random
import firebase_admin
from firebase_admin import credentials, firestore

# PHASE 2: Hardcode Emulator variable to ensure local isolated execution
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"

# Initialize Firebase Admin using default app behavior (no explicit cred for emulator)
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()

LISTINGS_DATA = [
    {
        "title": "Sunlit Studio in District 1",
        "price": 8500000, 
        "size": 35,
        "district": "District 1",
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
        "features": ["Air Conditioning", "WiFi", "Balcony"],
        "description": "A beautiful sunlit studio perfect for students looking for natural lighting."
    },
    {
        "title": "Modern 2-Bedroom Condo",
        "price": 15000000,
        "size": 75,
        "district": "District 2",
        "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
        "features": ["Gym", "Pool", "Parking"],
        "description": "Luxury living with gym and pool access perfect for young professionals."
    },
    {
        "title": "Cozy Loft near RMIT",
        "price": 9500000,
        "size": 45,
        "district": "District 7",
        "images": ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"],
        "features": ["High Ceilings", "Smart TV"],
        "description": "Stylish loft apartment with high ceilings in a quiet neighborhood."
    }
]

def seed_firestore():
    print("🌱 Starting Seed Process for Firestore Emulator...")
    print(f"Targeting Emulator: {os.environ.get('FIRESTORE_EMULATOR_HOST')}")
    
    apartments_ref = db.collection('apartments')
    
    # Clear existing listings to avoid duplicates in dev
    docs = apartments_ref.limit(10).stream()
    for doc in docs:
        doc.reference.delete()
        
    for item in LISTINGS_DATA:
        # Pushing data to Firestore
        apartments_ref.add(item)
        print(f"✅ Inserted property: {item['title']}")
        
    print("🎉 Mock listings seeded perfectly into Firestore Emulator!")

if __name__ == "__main__":
    seed_firestore()