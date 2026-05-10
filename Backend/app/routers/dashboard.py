from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user, current_user_optional
from ..schemas import (
    DashboardStats,
    ListingItem,
    ListingUpdate,
    MessageResponse,
    RevenueData,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def stats(user: Optional[dict] = Depends(current_user_optional)):
    db = store.db()
    listings = _filter_listings(db, user)
    total_sales = sum(item["price"] * item["sales"] for item in listings)
    return {
        "totalSales": round(total_sales, 2) or 85420.0,
        "totalArtworks": len(db["artworks"]),
        "followers": sum(a["followers"] for a in db["artists"]),
        "revenue": db["revenue"][-1]["revenue"] if db.get("revenue") else 0,
    }


@router.get("/listings", response_model=List[ListingItem])
def listings(user: Optional[dict] = Depends(current_user_optional)):
    return _filter_listings(store.db(), user)


@router.get("/revenue", response_model=List[RevenueData])
def revenue():
    return store.db().get("revenue", [])


@router.patch("/listings/{listing_id}", response_model=ListingItem)
def update_listing(listing_id: str, payload: ListingUpdate, user: dict = Depends(current_user)):
    listing = _get_listing(listing_id, user)
    for key, value in payload.model_dump(exclude_none=True).items():
        listing[key] = value
    store.save()
    return _serialize_listing(listing)


@router.delete("/listings/{listing_id}", response_model=MessageResponse)
def remove_listing(listing_id: str, user: dict = Depends(current_user)):
    db = store.db()
    listing = _get_listing(listing_id, user)
    db["listings"] = [l for l in db["listings"] if l["id"] != listing["id"]]
    store.save()
    return {"message": f"Removed {listing_id}"}


@router.post("/withdraw", response_model=MessageResponse)
def withdraw_earnings(user: dict = Depends(current_user)):
    return {"message": "Withdrawal request submitted (mock)"}


def _filter_listings(db: dict, user: Optional[dict]) -> List[dict]:
    items = db.get("listings", [])
    if not user or user["role"] == "admin":
        return [_serialize_listing(l) for l in items]
    own = [l for l in items if l.get("ownerId") == user["id"]]
    return [_serialize_listing(l) for l in (own or items)]


def _serialize_listing(listing: dict) -> dict:
    return {
        "id": listing["id"],
        "title": listing["title"],
        "price": listing["price"],
        "status": listing["status"],
        "views": listing["views"],
        "sales": listing["sales"],
    }


def _get_listing(listing_id: str, user: dict) -> dict:
    db = store.db()
    listing = next((l for l in db.get("listings", []) if l["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if user["role"] != "admin" and listing.get("ownerId") and listing["ownerId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your listing")
    return listing
