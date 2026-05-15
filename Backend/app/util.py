"""Helpers shared across routers."""

from typing import Optional

from fastapi import HTTPException

from . import store


def find_artist(artist_id: str) -> Optional[dict]:
    for a in store.db()["artists"]:
        if a["id"] == artist_id:
            return a
    return None


def find_artwork(artwork_id: str) -> Optional[dict]:
    for a in store.db()["artworks"]:
        if a["id"] == artwork_id:
            return a
    return None


def get_artwork_or_404(artwork_id: str) -> dict:
    art = find_artwork(artwork_id)
    if not art:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return art


def serialize_artist(artist: dict, viewer: Optional[dict] = None) -> dict:
    following = False
    if viewer:
        following = artist["id"] in viewer.get("following", [])
    return {
        "id": artist["id"],
        "name": artist["name"],
        "avatar": artist["avatar"],
        "bio": artist["bio"],
        "followers": artist["followers"],
        "isVerified": artist["isVerified"],
        "followingStatus": following,
    }


def serialize_artwork(art: dict, viewer: Optional[dict] = None, *, include_comments: bool = False) -> dict:
    db = store.db()
    # Handle both artistId and artist fields for backward compatibility
    artist_id = art.get("artistId") or (art.get("artist", {}).get("id") if isinstance(art.get("artist"), dict) else None)
    artist = find_artist(artist_id) or {
        "id": artist_id or "unknown",
        "name": "Unknown",
        "avatar": "",
        "bio": "",
        "followers": 0,
        "isVerified": False,
    }
    user_liked = bool(viewer and viewer["id"] in art.get("likedBy", []))
    out = {
        "id": art["id"],
        "title": art["title"],
        "artist": serialize_artist(artist, viewer),
        "image": art["image"],
        "price": art["price"],
        "category": art["category"],
        "tags": list(art.get("tags", [])),
        "description": art.get("description", ""),
        "story": art.get("story"),
        "youtubeUrl": art.get("youtubeUrl"),
        "createdAt": art["createdAt"],
        "likes": art.get("likes", 0),
        "userLiked": user_liked,
        "comments": db.get("comments", {}).get(art["id"], []) if include_comments else None,
    }
    return out
