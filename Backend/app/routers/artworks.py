from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from .. import store
from ..deps import current_user, current_user_optional
from ..exceptions import NotFoundError
from ..logging_config import get_logger
from ..schemas import (
    Artwork,
    ArtworkCreate,
    ArtworkUpdate,
    Comment,
    CommentCreate,
    LikeResponse,
    MessageResponse,
)
from ..util import find_artist, get_artwork_or_404, serialize_artwork
from ..validation import validate_artwork_data, validate_comment

log = get_logger("artworks")
router = APIRouter(prefix="/api/artworks", tags=["artworks"])


def _sort(items: list, sort_by: Optional[str]) -> list:
    """Sort artworks based on sort_by parameter"""
    if not sort_by:
        return items
    if sort_by == "price-low":
        return sorted(items, key=lambda a: a.get("price", 0))
    if sort_by == "price-high":
        return sorted(items, key=lambda a: a.get("price", 0), reverse=True)
    if sort_by == "trending":
        return sorted(items, key=lambda a: a.get("likes", 0), reverse=True)
    if sort_by == "newest":
        return sorted(items, key=lambda a: a.get("createdAt", ""), reverse=True)
    return items


@router.get("", response_model=List[Artwork])
def list_artworks(
    category: Optional[str] = None,
    tags: Optional[str] = Query(None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    viewer: Optional[dict] = Depends(current_user_optional),
):
    """List all artworks with optional filtering"""
    results = list(store.db().get("artworks", []))

    if category and category != "All":
        results = [a for a in results if a.get("category") == category]

    if tags:
        wanted = [t.strip() for t in tags.split(",") if t.strip()]
        if wanted:
            results = [a for a in results if any(t in a.get("tags", []) for t in wanted)]

    if min_price is not None:
        results = [a for a in results if a.get("price", 0) >= min_price]
    if max_price is not None:
        results = [a for a in results if a.get("price", 0) <= max_price]

    return [serialize_artwork(a, viewer) for a in _sort(results, sort_by)]


@router.get("/featured", response_model=List[Artwork])
def featured(viewer: Optional[dict] = Depends(current_user_optional)):
    """Get featured artworks"""
    items = store.db().get("artworks", [])[:6]
    return [serialize_artwork(a, viewer) for a in items]


@router.get("/trending", response_model=List[Artwork])
def trending(viewer: Optional[dict] = Depends(current_user_optional)):
    """Get trending artworks sorted by likes"""
    items = sorted(
        store.db().get("artworks", []),
        key=lambda a: a.get("likes", 0),
        reverse=True
    )[:8]
    return [serialize_artwork(a, viewer) for a in items]


@router.get("/search", response_model=List[Artwork])
def search(
    q: str = Query("", min_length=0),
    viewer: Optional[dict] = Depends(current_user_optional),
):
    """Search artworks by title, artist name, description, or tags"""
    needle = q.lower().strip()
    items = store.db().get("artworks", [])
    
    if not needle:
        return [serialize_artwork(a, viewer) for a in items]
    
    matches = []
    for a in items:
        artist = find_artist(a.get("artistId", "")) or {}
        if (
            needle in a.get("title", "").lower()
            or needle in artist.get("name", "").lower()
            or needle in a.get("description", "").lower()
            or any(needle in t.lower() for t in a.get("tags", []))
        ):
            matches.append(a)
    
    log.info(f"Search: '{q}' returned {len(matches)} results")
    return [serialize_artwork(m, viewer) for m in matches]


@router.get("/{artwork_id}", response_model=Artwork)
def get_artwork(artwork_id: str, viewer: Optional[dict] = Depends(current_user_optional)):
    """Get artwork by ID with comments"""
    art = get_artwork_or_404(artwork_id)
    return serialize_artwork(art, viewer, include_comments=True)


@router.post("", response_model=Artwork, status_code=201)
def create_artwork(payload: ArtworkCreate, user: dict = Depends(current_user)):
    # Allow any authenticated user to create artwork
    artist_id = payload.artistId or user["id"]
    if not find_artist(artist_id):
        store.db()["artists"].append(
            {
                "id": artist_id,
                "name": user["name"],
                "avatar": user["avatar"],
                "bio": user.get("bio", ""),
                "followers": 0,
                "isVerified": user["role"] == "admin",
            }
        )

    art_id = store.next_id("artwork", "art")
    art = {
        "id": art_id,
        "title": payload.title,
        "artistId": artist_id,
        "image": payload.image,
        "price": payload.price,
        "category": payload.category,
        "tags": payload.tags,
        "description": payload.description,
        "story": payload.story.model_dump() if payload.story else None,
        "youtubeUrl": payload.youtubeUrl,
        "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "likes": 0,
        "likedBy": [],
    }
    store.db()["artworks"].append(art)
    store.save()
    return serialize_artwork(art, user)


@router.patch("/{artwork_id}", response_model=Artwork)
def update_artwork(artwork_id: str, payload: ArtworkUpdate, user: dict = Depends(current_user)):
    art = get_artwork_or_404(artwork_id)
    if user["role"] != "admin" and art["artistId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your artwork")
    for key, value in payload.model_dump(exclude_none=True).items():
        if key == "story" and value is not None:
            art["story"] = value
        else:
            art[key] = value
    store.save()
    return serialize_artwork(art, user)


@router.delete("/{artwork_id}", response_model=MessageResponse)
def delete_artwork(artwork_id: str, user: dict = Depends(current_user)):
    db = store.db()
    art = get_artwork_or_404(artwork_id)
    if user["role"] != "admin" and art["artistId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your artwork")
    db["artworks"] = [a for a in db["artworks"] if a["id"] != artwork_id]
    db.get("comments", {}).pop(artwork_id, None)
    store.save()
    return {"message": f"Deleted {artwork_id}"}


# Likes ---------------------------------------------------------------------

@router.post("/{artwork_id}/like", response_model=LikeResponse)
def toggle_like(artwork_id: str, user: dict = Depends(current_user)):
    art = get_artwork_or_404(artwork_id)
    liked_by = art.setdefault("likedBy", [])
    if user["id"] in liked_by:
        liked_by.remove(user["id"])
        art["likes"] = max(0, art.get("likes", 0) - 1)
        liked = False
    else:
        liked_by.append(user["id"])
        art["likes"] = art.get("likes", 0) + 1
        liked = True
        favorites = user.setdefault("favorites", [])
        if artwork_id not in favorites:
            favorites.append(artwork_id)
    if not liked:
        favorites = user.setdefault("favorites", [])
        if artwork_id in favorites:
            favorites.remove(artwork_id)
    store.save()
    return {"liked": liked, "likes": art["likes"]}


# Comments ------------------------------------------------------------------

@router.get("/{artwork_id}/comments", response_model=List[Comment])
def list_comments(artwork_id: str):
    get_artwork_or_404(artwork_id)
    return store.db().get("comments", {}).get(artwork_id, [])


@router.post("/{artwork_id}/comments", response_model=Comment, status_code=201)
def add_comment(artwork_id: str, payload: CommentCreate, user: dict = Depends(current_user)):
    get_artwork_or_404(artwork_id)
    db = store.db()
    comments = db.setdefault("comments", {}).setdefault(artwork_id, [])
    comment = {
        "id": store.next_id("comment", "cmt"),
        "artworkId": artwork_id,
        "userId": user["id"],
        "username": user["name"],
        "avatar": user["avatar"],
        "text": payload.text.strip(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "likes": 0,
    }
    comments.insert(0, comment)
    store.save()
    return comment


@router.delete("/{artwork_id}/comments/{comment_id}", response_model=MessageResponse)
def delete_comment(artwork_id: str, comment_id: str, user: dict = Depends(current_user)):
    db = store.db()
    comments = db.get("comments", {}).get(artwork_id, [])
    target = next((c for c in comments if c["id"] == comment_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Comment not found")
    if user["role"] != "admin" and target["userId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your comment")
    db["comments"][artwork_id] = [c for c in comments if c["id"] != comment_id]
    store.save()
    return {"message": f"Deleted {comment_id}"}


@router.post("/{artwork_id}/comments/{comment_id}/like", response_model=Comment)
def like_comment(artwork_id: str, comment_id: str, user: dict = Depends(current_user)):
    comments = store.db().get("comments", {}).get(artwork_id, [])
    target = next((c for c in comments if c["id"] == comment_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Comment not found")
    target["likes"] = target.get("likes", 0) + 1
    store.save()
    return target
