import random
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user, current_user_optional
from ..schemas import (
    Artwork,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSession,
    ChatSuggestRequest,
    MessageResponse,
)
from ..util import serialize_artwork

router = APIRouter(tags=["chat"])

CANNED_RESPONSES = [
    "That's an interesting perspective! Let me find similar artworks for you.",
    "I love the energy of this piece. Would you like to explore more abstract works?",
    "This style resonates with many collectors. Shall I show you related pieces?",
    "Great taste! This artist is trending right now.",
    "I'm analyzing this — it has elements of both contemporary and classical influence.",
    "Based on what you've shared, I can suggest a few directions worth exploring.",
]


def _suggest(viewer: Optional[dict], n: int = 3) -> List[dict]:
    artworks = store.db()["artworks"]
    if not artworks:
        return []
    sample = random.sample(artworks, min(n, len(artworks)))
    return [serialize_artwork(a, viewer) for a in sample]


def _get_or_create_session(session_id: Optional[str], user: Optional[dict]) -> dict:
    db = store.db()
    sessions = db.setdefault("chatSessions", {})
    if session_id and session_id in sessions:
        return sessions[session_id]
    new_id = store.next_id("session", "session_")
    session = {
        "id": new_id,
        "userId": user["id"] if user else None,
        "messages": [],
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    sessions[new_id] = session
    return session


# Public chatbot wrapper -----------------------------------------------------

@router.post("/api/chatbot/message", response_model=ChatMessageResponse)
def chatbot_message(
    payload: ChatMessageRequest,
    viewer: Optional[dict] = Depends(current_user_optional),
):
    db = store.db()
    session = _get_or_create_session(payload.sessionId, viewer)
    now = datetime.now(timezone.utc).isoformat()
    user_msg = {
        "id": store.next_id("comment", "msg_"),
        "sender": "user",
        "content": payload.message,
        "timestamp": now,
    }
    response_text = random.choice(CANNED_RESPONSES)
    bot_msg = {
        "id": store.next_id("comment", "msg_"),
        "sender": "bot",
        "content": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    session["messages"].extend([user_msg, bot_msg])
    store.save()
    return {
        "sessionId": session["id"],
        "response": response_text,
        "suggestedArtworks": _suggest(viewer, 3),
    }


@router.post("/api/chatbot/suggest", response_model=List[Artwork])
def chatbot_suggest(
    payload: ChatSuggestRequest,
    viewer: Optional[dict] = Depends(current_user_optional),
):
    return _suggest(viewer, 3)


# Persisted sessions (auth) --------------------------------------------------

@router.get("/api/chat/sessions", response_model=List[ChatSession])
def list_sessions(user: dict = Depends(current_user)):
    sessions = store.db().get("chatSessions", {})
    return [s for s in sessions.values() if s.get("userId") == user["id"]]


@router.post("/api/chat/sessions", response_model=ChatSession, status_code=201)
def create_session(user: dict = Depends(current_user)):
    session = _get_or_create_session(None, user)
    store.save()
    return session


@router.get("/api/chat/sessions/{session_id}", response_model=ChatSession)
def get_session(session_id: str, user: dict = Depends(current_user)):
    session = store.db().get("chatSessions", {}).get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("userId") not in (user["id"], None):
        raise HTTPException(status_code=403, detail="Not your session")
    return session


@router.delete("/api/chat/sessions/{session_id}", response_model=MessageResponse)
def delete_session(session_id: str, user: dict = Depends(current_user)):
    sessions = store.db().get("chatSessions", {})
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("userId") not in (user["id"], None):
        raise HTTPException(status_code=403, detail="Not your session")
    sessions.pop(session_id, None)
    store.save()
    return {"message": f"Deleted {session_id}"}
