from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user
from ..schemas import (
    Artwork,
    MessageResponse,
    Notification,
    ProfileUpdate,
    Settings,
    UserProfile,
)
from ..util import serialize_artwork

router = APIRouter(prefix="/api/users", tags=["users"])


def _build_profile(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar": user["avatar"],
        "role": user["role"],
        "createdAt": user["createdAt"],
        "bio": user.get("bio", ""),
        "location": user.get("location", ""),
        "website": user.get("website", ""),
        "followers": _follower_count_of_user(user),
        "following": len(user.get("following", [])),
        "favorites": len(user.get("favorites", [])),
    }


def _follower_count_of_user(user: dict) -> int:
    """Count how many users follow this user (mirrors as artist if any)."""
    if user["role"] != "artist":
        return 0
    db = store.db()
    artist = next((a for a in db["artists"] if a["id"] == user["id"]), None)
    return artist["followers"] if artist else 0


@router.get("/me/profile", response_model=UserProfile)
def my_profile(user: dict = Depends(current_user)):
    return _build_profile(user)


@router.patch("/me/profile", response_model=UserProfile)
def update_profile(payload: ProfileUpdate, user: dict = Depends(current_user)):
    for key, value in payload.model_dump(exclude_none=True).items():
        user[key] = value
    store.save()
    return _build_profile(user)


@router.get("/me/settings", response_model=Settings)
def my_settings(user: dict = Depends(current_user)):
    return store.db().get("settings", {}).get(user["id"], Settings().model_dump())


@router.put("/me/settings", response_model=Settings)
def update_settings(payload: Settings, user: dict = Depends(current_user)):
    store.db().setdefault("settings", {})[user["id"]] = payload.model_dump()
    store.save()
    return payload


@router.get("/me/notifications", response_model=List[Notification])
def my_notifications(user: dict = Depends(current_user)):
    return store.db().get("notifications", {}).get(user["id"], [])


@router.post("/me/notifications/{notification_id}/read", response_model=Notification)
def mark_read(notification_id: str, user: dict = Depends(current_user)):
    items = store.db().get("notifications", {}).get(user["id"], [])
    target = next((n for n in items if n["id"] == notification_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Notification not found")
    target["read"] = True
    store.save()
    return target


@router.delete("/me/notifications", response_model=MessageResponse)
def clear_notifications(user: dict = Depends(current_user)):
    store.db().setdefault("notifications", {})[user["id"]] = []
    store.save()
    return {"message": "Cleared"}


@router.get("/me/favorites", response_model=List[Artwork])
def my_favorites(user: dict = Depends(current_user)):
    db = store.db()
    favorites = set(user.get("favorites", []))
    return [serialize_artwork(a, user) for a in db["artworks"] if a["id"] in favorites]


@router.get("/me/activity")
def my_activity(user: dict = Depends(current_user)):
    db = store.db()
    activity = []
    for fav_id in user.get("favorites", []):
        art = next((a for a in db["artworks"] if a["id"] == fav_id), None)
        if art:
            activity.append(
                {
                    "type": "favorite",
                    "title": art["title"],
                    "id": art["id"],
                    "timestamp": art.get("createdAt"),
                }
            )
    for fid in user.get("following", []):
        artist = next((a for a in db["artists"] if a["id"] == fid), None)
        if artist:
            activity.append(
                {
                    "type": "follow",
                    "title": artist["name"],
                    "id": artist["id"],
                    "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                }
            )
    for order in db.get("orders", []):
        if order["userId"] == user["id"]:
            activity.append(
                {
                    "type": "purchase",
                    "title": f"Order {order['id']}",
                    "id": order["id"],
                    "timestamp": order["createdAt"],
                }
            )
    activity.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    return activity[:50]
