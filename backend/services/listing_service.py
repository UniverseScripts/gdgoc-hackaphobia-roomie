from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models.listing import Listing
from schemas.listing import ListingCreate


async def create_listing(db: AsyncSession, listing_data: ListingCreate, owner_id: int) -> Listing:
    """
    Creates a new listing linked to the logged-in user.
    """
    new_listing = Listing(
        **listing_data.model_dump(),
        owner_id=owner_id
    )
    db.add(new_listing)
    await db.commit()
    await db.refresh(new_listing)
    return new_listing


async def get_all_listings(db: AsyncSession, skip: int = 0, limit: int = 20) -> list[Listing]:
    """
    Fetches all listings with pagination.
    """
    query = select(Listing).offset(skip).limit(
        limit).order_by(Listing.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


async def get_listings_by_location(db: AsyncSession, location: str) -> list[Listing]:
    """
    Example of a specific filter service (e.g. 'District 1')
    """
    query = select(Listing).where(Listing.location == location)
    result = await db.execute(query)
    return result.scalars().all()


async def delete_listing(db: AsyncSession, listing_id: int, owner_id: int) -> bool:
    """
    Deletes a listing ONLY if the owner_id matches.
    Returns True if deleted, False if not found or unauthorized.
    """
    # 1. Check existence and ownership
    query = select(Listing).where(
        Listing.id == listing_id, Listing.owner_id == owner_id)
    result = await db.execute(query)
    listing = result.scalar_one_or_none()

    if not listing:
        return False

    # 2. Delete
    delete_query = delete(Listing).where(
        Listing.id == listing_id, Listing.owner_id == owner_id)
    await db.execute(delete_query)
    await db.commit()
    return True
