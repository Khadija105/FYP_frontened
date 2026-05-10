from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user, current_user_optional
from ..schemas import Artist, Artwork, MessageResponse
from ..util import find_artist, serialize_artist, serialize_artwork

router = APIRouter(prefix="/api/artists", tags=["artists"])


@router.get("", response_model=List[Artist])
def list_artists(viewer: Optional[dict] = Depends(current_user_optional)):
    return [serialize_artist(a, viewer) for a in store.db()["artists"]]


@router.get("/trending", response_model=List[Artist])
def trending(viewer: Optional[dict] = Depends(current_user_optional)):
    items = sorted(store.db()["artists"], key=lambda a: a["followers"], reverse=True)
    return [serialize_artist(a, viewer) for a in items]


@router.get("/{artist_id}", response_model=Artist)
def get_artist(artist_id: str, viewer: Optional[dict] = Depends(current_user_optional)):
    artist = find_artist(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return serialize_artist(artist, viewer)


@router.get("/{artist_id}/artworks", response_model=List[Artwork])
def artist_artworks(artist_id: str, viewer: Optional[dict] = Depends(current_user_optional)):
    return [
        serialize_artwork(a, viewer)
        for a in store.db()["artworks"]
        if a["artistId"] == artist_id
    ]


@router.post("/{artist_id}/follow", response_model=Artist)
def follow(artist_id: str, user: dict = Depends(current_user)):
    artist = find_artist(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    following = user.setdefault("following", [])
    if artist_id not in following:
        following.append(artist_id)
        artist["followers"] = artist.get("followers", 0) + 1
        store.save()
    return serialize_artist(artist, user)


@router.post("/{artist_id}/unfollow", response_model=Artist)
def unfollow(artist_id: str, user: dict = Depends(current_user)):
    artist = find_artist(artist_id)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    following = user.setdefault("following", [])
    if artist_id in following:
        following.remove(artist_id)
        artist["followers"] = max(0, artist.get("followers", 0) - 1)
        store.save()
    return serialize_artist(artist, user)
