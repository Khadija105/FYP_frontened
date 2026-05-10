from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import admin_user
from ..schemas import (
    Artwork,
    MessageResponse,
    User,
    VerificationRequest,
)
from ..util import serialize_artwork

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[User])
def list_users(_: dict = Depends(admin_user)):
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "name": u["name"],
            "avatar": u["avatar"],
            "role": u["role"],
            "createdAt": u["createdAt"],
        }
        for u in store.db()["users"]
    ]


@router.get("/artworks", response_model=List[Artwork])
def list_artworks(_: dict = Depends(admin_user)):
    return [serialize_artwork(a) for a in store.db()["artworks"]]


@router.delete("/artworks/{artwork_id}", response_model=MessageResponse)
def delete_artwork(artwork_id: str, _: dict = Depends(admin_user)):
    db = store.db()
    if not any(a["id"] == artwork_id for a in db["artworks"]):
        raise HTTPException(status_code=404, detail="Artwork not found")
    db["artworks"] = [a for a in db["artworks"] if a["id"] != artwork_id]
    db.get("comments", {}).pop(artwork_id, None)
    store.save()
    return {"message": f"Deleted {artwork_id}"}


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str, admin: dict = Depends(admin_user)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    db = store.db()
    if not any(u["id"] == user_id for u in db["users"]):
        raise HTTPException(status_code=404, detail="User not found")
    db["users"] = [u for u in db["users"] if u["id"] != user_id]
    db["tokens"] = {tok: uid for tok, uid in db.get("tokens", {}).items() if uid != user_id}
    db.get("settings", {}).pop(user_id, None)
    db.get("notifications", {}).pop(user_id, None)
    store.save()
    return {"message": f"Deleted {user_id}"}


@router.get("/verification-requests", response_model=List[VerificationRequest])
def list_verification_requests(_: dict = Depends(admin_user)):
    return store.db().get("verificationRequests", [])


@router.post("/verification-requests/{request_id}/approve", response_model=VerificationRequest)
def approve_verification(request_id: str, _: dict = Depends(admin_user)):
    return _set_verification_status(request_id, "approved")


@router.post("/verification-requests/{request_id}/reject", response_model=VerificationRequest)
def reject_verification(request_id: str, _: dict = Depends(admin_user)):
    return _set_verification_status(request_id, "rejected")


def _set_verification_status(request_id: str, status: str) -> dict:
    db = store.db()
    target = next(
        (r for r in db.get("verificationRequests", []) if r["id"] == request_id),
        None,
    )
    if not target:
        raise HTTPException(status_code=404, detail="Verification request not found")
    target["status"] = status
    if status == "approved":
        artist = next((a for a in db["artists"] if a["id"] == target["artistId"]), None)
        if artist:
            artist["isVerified"] = True
    store.save()
    return target
