import random
from typing import List

from fastapi import APIRouter

from .. import data
from ..schemas import (
    Artwork,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSuggestRequest,
)

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

CANNED_RESPONSES = [
    "That's an interesting perspective! Let me find similar artworks for you.",
    "I love the energy of this piece. Would you like to explore more abstract works?",
    "This style resonates with many collectors. Shall I show you related pieces?",
    "Great taste! This artist is trending right now.",
    "I'm analyzing this - it has elements of both contemporary and classical influence.",
]


@router.post("/message", response_model=ChatMessageResponse)
def send_message(payload: ChatMessageRequest):
    response = random.choice(CANNED_RESPONSES)
    return {
        "response": response,
        "suggestedArtworks": data.ARTWORKS[:3],
    }


@router.post("/suggest", response_model=List[Artwork])
def suggest(payload: ChatSuggestRequest):
    if not data.ARTWORKS:
        return []
    start = random.randint(0, max(0, len(data.ARTWORKS) - 1))
    end = min(len(data.ARTWORKS), start + 3)
    return data.ARTWORKS[start:end] or data.ARTWORKS[:3]
