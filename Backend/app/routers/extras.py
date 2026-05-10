"""Room mockup layouts + artist verification submissions + configuration."""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user
from ..schemas import (
    MessageResponse,
    RoomLayout,
    RoomLayoutCreate,
    VerificationRequest,
    VerificationSubmit,
)

router = APIRouter(tags=["extras"])

# Configuration constants
ARTWORK_CATEGORIES = [
    "Digital Art",
    "Abstract",
    "Minimalism",
    "Photography",
    "Illustration",
    "3D Art",
    "Mixed Media",
]


# Configuration endpoints ---------------------------------------------------

@router.get("/api/config/categories", response_model=List[str])
def get_categories():
    """Get list of available artwork categories"""
    return ARTWORK_CATEGORIES


# Room layouts ---------------------------------------------------------------

@router.get("/api/room-layouts", response_model=List[RoomLayout])
def my_layouts(user: dict = Depends(current_user)):
    return [
        l for l in store.db().get("roomLayouts", []) if l.get("userId") == user["id"]
    ]


@router.post("/api/room-layouts", response_model=RoomLayout, status_code=201)
def create_layout(payload: RoomLayoutCreate, user: dict = Depends(current_user)):
    db = store.db()
    if not any(a["id"] == payload.artworkId for a in db["artworks"]):
        raise HTTPException(status_code=404, detail="Artwork not found")

    layout = {
        "id": store.next_id("layout", "layout_"),
        "userId": user["id"],
        "artworkId": payload.artworkId,
        "roomImage": payload.roomImage,
        "size": payload.size,
        "x": payload.x,
        "y": payload.y,
        "name": payload.name or "Untitled layout",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    db.setdefault("roomLayouts", []).append(layout)
    store.save()
    return layout


@router.delete("/api/room-layouts/{layout_id}", response_model=MessageResponse)
def delete_layout(layout_id: str, user: dict = Depends(current_user)):
    db = store.db()
    target = next(
        (l for l in db.get("roomLayouts", []) if l["id"] == layout_id),
        None,
    )
    if not target:
        raise HTTPException(status_code=404, detail="Layout not found")
    if target["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your layout")
    db["roomLayouts"] = [l for l in db["roomLayouts"] if l["id"] != layout_id]
    store.save()
    return {"message": f"Deleted {layout_id}"}


# Verification requests ------------------------------------------------------

@router.post("/api/verifications", response_model=VerificationRequest, status_code=201)
def submit_verification(payload: VerificationSubmit, user: dict = Depends(current_user)):
    db = store.db()
    requests = db.setdefault("verificationRequests", [])
    existing = next(
        (r for r in requests if r["artistId"] == user["id"] and r["status"] == "pending"),
        None,
    )
    if existing:
        raise HTTPException(status_code=409, detail="A pending verification already exists")

    request = {
        "id": store.next_id("verification", "vr"),
        "artistId": user["id"],
        "artistName": user["name"],
        "status": "pending",
        "submittedAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "documentUrl": payload.documentUrl,
        "notes": payload.notes or "",
    }
    requests.append(request)
    store.save()
    return request


@router.get("/api/verifications/me", response_model=Optional[VerificationRequest])
def my_verification(user: dict = Depends(current_user)):
    db = store.db()
    candidates = [r for r in db.get("verificationRequests", []) if r["artistId"] == user["id"]]
    if not candidates:
        return None
    candidates.sort(key=lambda r: r["submittedAt"], reverse=True)
    return candidates[0]
