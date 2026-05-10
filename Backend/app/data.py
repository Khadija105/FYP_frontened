"""In-memory seed data ported from frontend mockData.ts."""

ARTISTS = [
    {
        "id": "artist1",
        "name": "Sofia Chen",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        "bio": "Contemporary digital artist exploring the intersection of technology and human emotion.",
        "followers": 15420,
        "isVerified": True,
    },
    {
        "id": "artist2",
        "name": "Marcus Johnson",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        "bio": "Abstract expressionist pushing boundaries of traditional art forms.",
        "followers": 22100,
        "isVerified": True,
    },
    {
        "id": "artist3",
        "name": "Luna Rivera",
        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        "bio": "Surrealist explorer of dreams and subconsciousness through visual storytelling.",
        "followers": 8900,
        "isVerified": True,
    },
    {
        "id": "artist4",
        "name": "David Kim",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        "bio": "Minimalist artist focusing on form, space, and light.",
        "followers": 12500,
        "isVerified": True,
    },
]


def _artist(idx: int) -> dict:
    return ARTISTS[idx]


ARTWORKS = [
    {
        "id": "art1",
        "title": "Ethereal Reverie",
        "artist": _artist(0),
        "image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop",
        "price": 2500,
        "category": "Digital Art",
        "tags": ["abstract", "dreamy", "colorful"],
        "description": "A dreamlike digital composition exploring consciousness and color.",
        "story": {
            "statement": "Art is a language that speaks to the soul, bypassing rational thought.",
            "process": "Created over 3 months using digital painting techniques and AI assistance.",
            "inspiration": "Inspired by meditation and lucid dreams.",
        },
        "createdAt": "2024-01-15",
        "likes": 1240,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art2",
        "title": "Urban Geometry",
        "artist": _artist(1),
        "image": "https://images.unsplash.com/photo-1578321272176-b7beffcc6ccf?w=800&h=800&fit=crop",
        "price": 3200,
        "category": "Abstract",
        "tags": ["geometric", "urban", "modern"],
        "description": "Bold geometric exploration of urban landscape through abstraction.",
        "story": {
            "statement": "Cities are the new canvas for artistic expression.",
            "process": "Created using generative algorithms and manual refinement.",
            "inspiration": "Architecture and city lights at night.",
        },
        "createdAt": "2024-02-20",
        "likes": 2150,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art3",
        "title": "Liquid Dreams",
        "artist": _artist(2),
        "image": "https://images.unsplash.com/photo-1578482326433-c44fc8e1f1e0?w=800&h=800&fit=crop",
        "price": 1800,
        "category": "Digital Art",
        "tags": ["surreal", "flowing", "organic"],
        "description": "A surreal exploration of fluidity and transformation.",
        "createdAt": "2024-01-10",
        "likes": 950,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art4",
        "title": "Minimalist Essence",
        "artist": _artist(3),
        "image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop",
        "price": 2100,
        "category": "Minimalism",
        "tags": ["minimal", "clean", "peaceful"],
        "description": "Stripped down to its essence, simplicity as elegance.",
        "createdAt": "2024-02-05",
        "likes": 1820,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art5",
        "title": "Chromatic Harmony",
        "artist": _artist(0),
        "image": "https://images.unsplash.com/photo-1578926078328-cbf4f8d0f8c0?w=800&h=800&fit=crop",
        "price": 2800,
        "category": "Digital Art",
        "tags": ["colorful", "harmonious", "vibrant"],
        "description": "A celebration of color relationships and visual balance.",
        "createdAt": "2024-03-01",
        "likes": 1650,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art6",
        "title": "Void Contemplation",
        "artist": _artist(1),
        "image": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=800&fit=crop",
        "price": 3500,
        "category": "Abstract",
        "tags": ["dark", "contemplative", "deep"],
        "description": "Exploring emptiness and the space between existence.",
        "createdAt": "2024-02-28",
        "likes": 2340,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art7",
        "title": "Genesis Flow",
        "artist": _artist(2),
        "image": "https://images.unsplash.com/photo-1578321272176-b7beffcc6ccf?w=800&h=800&fit=crop",
        "price": 2200,
        "category": "Digital Art",
        "tags": ["flowing", "creative", "cosmic"],
        "description": "The birth of ideas in visual form.",
        "createdAt": "2024-01-25",
        "likes": 1420,
        "userLiked": False,
        "comments": [],
    },
    {
        "id": "art8",
        "title": "Spacetime Fold",
        "artist": _artist(3),
        "image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop",
        "price": 2900,
        "category": "Minimalism",
        "tags": ["geometric", "spatial", "modern"],
        "description": "A representation of dimensional perspective and space.",
        "createdAt": "2024-03-10",
        "likes": 1760,
        "userLiked": False,
        "comments": [],
    },
]


USERS = [
    {
        "id": "user1",
        "email": "alex@example.com",
        "name": "Alex Thompson",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        "role": "user",
        "createdAt": "2023-06-15",
    },
    {
        "id": "user2",
        "email": "sophia@example.com",
        "name": "Sophia Chen",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        "role": "artist",
        "createdAt": "2023-05-10",
    },
]


VERIFICATION_REQUESTS = [
    {
        "id": "vr1",
        "artistId": "artist1",
        "artistName": "Sofia Chen",
        "status": "pending",
        "submittedAt": "2024-03-15",
    },
    {
        "id": "vr2",
        "artistId": "artist2",
        "artistName": "Marcus Johnson",
        "status": "approved",
        "submittedAt": "2024-02-20",
    },
    {
        "id": "vr3",
        "artistId": "artist3",
        "artistName": "Luna Rivera",
        "status": "rejected",
        "submittedAt": "2024-01-10",
    },
]


LISTINGS = [
    {"id": "list1", "title": "Ethereal Reverie", "price": 2500, "status": "active", "views": 1240, "sales": 0},
    {"id": "list2", "title": "Ocean's Whisper", "price": 1800, "status": "sold", "views": 890, "sales": 1},
    {"id": "list3", "title": "Neon Nights", "price": 3200, "status": "active", "views": 2100, "sales": 0},
    {"id": "list4", "title": "Digital Dreams", "price": 2200, "status": "delisted", "views": 450, "sales": 0},
    {"id": "list5", "title": "Cosmic Waves", "price": 2800, "status": "active", "views": 1560, "sales": 1},
]


REVENUE = [
    {"month": "Jan", "revenue": 12000},
    {"month": "Feb", "revenue": 19000},
    {"month": "Mar", "revenue": 15000},
    {"month": "Apr", "revenue": 28000},
    {"month": "May", "revenue": 24000},
    {"month": "Jun", "revenue": 32000},
]


CURRENT_USER = {
    "id": "user1",
    "email": "user@example.com",
    "name": "Alex Thompson",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "role": "user",
    "createdAt": "2023-06-15",
}


FOLLOWED_ARTISTS: set[str] = set()
