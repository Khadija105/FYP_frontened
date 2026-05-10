from typing import Optional

from fastapi import Depends, Header, HTTPException, status

from . import store


def _user_from_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    db = store.db()
    user_id = db.get("tokens", {}).get(token)
    if not user_id:
        return None
    for user in db.get("users", []):
        if user["id"] == user_id:
            return user
    return None


def current_user_optional(
    authorization: Optional[str] = Header(default=None),
) -> Optional[dict]:
    if not authorization:
        return None
    parts = authorization.split(maxsplit=1)
    token = parts[1].strip() if len(parts) == 2 and parts[0].lower() == "bearer" else authorization.strip()
    return _user_from_token(token)


def current_user(user: Optional[dict] = Depends(current_user_optional)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def admin_user(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user


def get_user_by_id(user_id: str) -> Optional[dict]:
    for u in store.db().get("users", []):
        if u["id"] == user_id:
            return u
    return None


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "avatar": user["avatar"],
        "role": user["role"],
        "createdAt": user["createdAt"],
    }
