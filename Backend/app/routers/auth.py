from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from .. import store
from ..deps import current_user, public_user
from ..exceptions import AuthenticationError, ConflictError, NotFoundError
from ..logging_config import get_logger
from ..schemas import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    PasswordChange,
    RegisterRequest,
    User,
)
from ..security import hash_password, new_token, verify_password
from ..validation import validate_user_data

log = get_logger("auth")
router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_token_for(user: dict) -> dict:
    """Issue a new authentication token for a user"""
    db = store.db()
    token = new_token()
    db.setdefault("tokens", {})[token] = user["id"]
    store.save()
    log.info(f"Token issued for user {user['id']}")
    return {"user": public_user(user), "token": token}


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    """Login with email and password"""
    db = store.db()
    user = next(
        (u for u in db.get("users", []) if u["email"].lower() == payload.email.lower()),
        None,
    )
    if not user or not verify_password(payload.password, user.get("passwordHash", "")):
        log.warning(f"Failed login attempt for email: {payload.email}")
        raise AuthenticationError("Invalid email or password")
    
    log.info(f"User {user['id']} logged in successfully")
    return _issue_token_for(user)


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest):
    """Register a new user"""
    # Validate input
    validate_user_data(payload.name, payload.email, payload.password)
    
    db = store.db()
    email = payload.email.lower()
    
    # Check if email already exists
    if any(u["email"].lower() == email for u in db.get("users", [])):
        log.warning(f"Registration attempt with existing email: {email}")
        raise ConflictError("Email already registered")

    user_id = store.next_id("user", "user")
    user = {
        "id": user_id,
        "email": email,
        "name": payload.name,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "passwordHash": hash_password(payload.password),
        "bio": "",
        "location": "",
        "website": "",
        "following": [],
        "favorites": [],
    }
    db.setdefault("users", []).append(user)
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
    
    log.info(f"New user registered: {user_id}")
    return _issue_token_for(user)


@router.get("/me", response_model=User)
def me(user: dict = Depends(current_user)):
    """Get current user information"""
    return public_user(user)


@router.post("/logout", response_model=MessageResponse)
def logout(
    user: dict = Depends(current_user),
    authorization: Optional[str] = None,
):
    """Logout and invalidate token"""
    if authorization:
        parts = authorization.split(maxsplit=1)
        token = parts[1].strip() if len(parts) == 2 else authorization.strip()
        store.db().get("tokens", {}).pop(token, None)
        store.save()
        log.info(f"User {user['id']} logged out")
    
    return {"message": "Logged out successfully"}


@router.post("/change-password", response_model=MessageResponse)
def change_password(payload: PasswordChange, user: dict = Depends(current_user)):
    """Change user password"""
    # Validate current password
    if not verify_password(payload.currentPassword, user.get("passwordHash", "")):
        log.warning(f"Failed password change attempt for user {user['id']}")
        raise AuthenticationError("Current password is incorrect")
    
    user["passwordHash"] = hash_password(payload.newPassword)
    store.save()
    log.info(f"Password changed for user {user['id']}")
    return {"message": "Password changed successfully"}


@router.delete("/me", response_model=MessageResponse)
def delete_account(user: dict = Depends(current_user)):
    """Delete user account"""
    db = store.db()
    db.setdefault("users", []).remove(user)
    
    # Clean up related data
    for key in ["tokens", "settings", "notifications"]:
        db.get(key, {}).pop(user["id"], None)
    
    store.save()
    log.info(f"Account deleted for user {user['id']}")
    return {"message": "Account deleted successfully"}
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
