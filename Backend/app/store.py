"""MongoDB-backed datastore for the art marketplace application."""

from typing import Any
from .database import get_collection, get_database
from .data import ARTISTS, ARTWORKS, USERS, VERIFICATION_REQUESTS, LISTINGS, REVENUE


_db_state = {}

def initialize() -> None:
    """Initialize MongoDB collections with seed data if empty."""
    db = get_database()

    collections = [
        ("artists", ARTISTS),
        ("artworks", ARTWORKS),
        ("users", USERS),
        ("verification_requests", VERIFICATION_REQUESTS),
        ("listings", LISTINGS),
        ("revenue", REVENUE),
    ]

    for collection_name, seed_data in collections:
        col = db[collection_name]
        if col.count_documents({}) == 0:
            col.insert_many(seed_data)
            print(f"[OK] Initialized {collection_name} collection")

    _create_indexes()


def _create_indexes() -> None:
    """Create database indexes for better performance."""
    db = get_database()

    db.users.create_index("email", unique=True, sparse=True)
    db.artworks.create_index("artistId")
    db.artists.create_index("id", sparse=True)
    print("[OK] Created database indexes")


class _MongoList(list):
    """A list-like object that syncs changes to MongoDB."""
    def __init__(self, collection_name, documents):
        super().__init__(documents)
        self.collection_name = collection_name
        self.collection = get_collection(collection_name)

    def append(self, item):
        super().append(item)
        if "_id" not in item:
            self.collection.insert_one(item)
        else:
            self.collection.update_one({"_id": item["_id"]}, {"$set": item})


def db() -> dict[str, Any]:
    """Get database connection wrapper for backward compatibility."""
    global _db_state

    class DBWrapper(dict):
        def __missing__(self, key):
            # Dict-like collections stored in global state
            if key in ("tokens", "settings", "notifications"):
                if key not in _db_state:
                    _db_state[key] = {}
                return _db_state[key]

            # List collections from MongoDB
            documents = list(get_collection(key).find())
            return _MongoList(key, documents)

        def get(self, key, default=None):
            # Try to get from internal dict storage first
            if key in dict.keys(self):
                return dict.__getitem__(self, key)

            # Dict-like collections
            if key in ("tokens", "settings", "notifications"):
                if key in _db_state:
                    return _db_state[key]
                return default if default is not None else {}

            # List collections
            documents = list(get_collection(key).find())
            if not documents:
                return default
            return _MongoList(key, documents)

        def setdefault(self, key, default=None):
            # Check internal storage first
            if key in dict.keys(self):
                return dict.__getitem__(self, key)

            # Dict-like collections use global state
            if key in ("tokens", "settings", "notifications"):
                if key not in _db_state:
                    _db_state[key] = default if default is not None else {}
                return _db_state[key]

            # List collections
            if default is None:
                default = {}
            dict.__setitem__(self, key, default)
            return default

    return DBWrapper()


def save() -> None:
    """MongoDB auto-saves changes, but keeping this for compatibility."""
    pass


def next_id(resource_type: str, prefix: str) -> str:
    """Generate next ID for a resource."""
    counters = get_database()["_counters"]
    result = counters.find_one_and_update(
        {"_id": resource_type},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return f"{prefix}{result['seq']}"


def reset() -> None:
    """Wipe all collections and reload seed data. Used for testing."""
    global _db_state
    _db_state = {}
    db_instance = get_database()
    for collection_name in db_instance.list_collection_names():
        db_instance.drop_collection(collection_name)
    initialize()
