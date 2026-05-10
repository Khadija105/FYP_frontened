from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from .. import store
from ..deps import current_user, public_user
from ..schemas import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    PasswordChange,
    RegisterRequest,
    User,
)
from ..security import hash_password, new_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_token_for(user: dict) -> dict:
    db = store.db()
    token = new_token()
    db.setdefault("tokens", {})[token] = user["id"]
    store.save()
    return {"user": public_user(user), "token": token}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    db = store.db()
    user = next(
        (u for u in db["users"] if u["email"].lower() == payload.email.lower()),
        None,
    )
    if not user or not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _issue_token_for(user)


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest):
    db = store.db()
    email = payload.email.lower()
    if any(u["email"].lower() == email for u in db["users"]):
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = store.next_id("user", "user")
    user = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
        "role": "user",
        "createdAt": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "passwordHash": hash_password(payload.password),
        "bio": "",
        "location": "",
        "website": "",
        "following": [],
        "favorites": [],
    }
    db["users"].append(user)
    db.setdefault("settings", {})[user_id] = {
        "emailNotifications": True,
        "pushNotifications": True,
        "marketingEmails": False,
        "privateProfile": False,
        "twoFactorAuth": False,
        "theme": "light",
        "language": "en",
    }
    db.setdefault("notifications", {})[user_id] = []
    store.save()
    return _issue_token_for(user)


@router.get("/me", response_model=User)
def me(user: dict = Depends(current_user)):
    return public_user(user)


@router.post("/logout", response_model=MessageResponse)
def logout(
    user: dict = Depends(current_user),
    authorization: Optional[str] = Header(default=None),
):
    if authorization:
        parts = authorization.split(maxsplit=1)
        token = parts[1].strip() if len(parts) == 2 else authorization.strip()
        store.db().get("tokens", {}).pop(token, None)
        store.save()
    return {"message": "Logged out"}


@router.post("/change-password", response_model=MessageResponse)
def change_password(payload: PasswordChange, user: dict = Depends(current_user)):
    if not verify_password(payload.currentPassword, user.get("passwordHash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user["passwordHash"] = hash_password(payload.newPassword)
    store.save()
    return {"message": "Password updated"}


@router.delete("/me", response_model=MessageResponse)
def delete_account(user: dict = Depends(current_user)):
    db = store.db()
    db["users"] = [u for u in db["users"] if u["id"] != user["id"]]
    db["tokens"] = {tok: uid for tok, uid in db.get("tokens", {}).items() if uid != user["id"]}
    db.get("settings", {}).pop(user["id"], None)
    db.get("notifications", {}).pop(user["id"], None)
    store.save()
    return {"message": "Account deleted"}
