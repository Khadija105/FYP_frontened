from pymongo import MongoClient
from pymongo.server_api import ServerApi
from contextlib import contextmanager
import os
from typing import Optional

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://ghafeer414_db_user:alQjR3R03bTOs075@cluster0.bzcqvrc.mongodb.net/"
)

DATABASE_NAME = "art_marketplace"

_client: Optional[MongoClient] = None


def get_client() -> MongoClient:
    """Get or create MongoDB client."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
        try:
            _client.admin.command('ping')
            print("[OK] Successfully connected to MongoDB!")
        except Exception as e:
            print(f"[ERROR] Failed to connect to MongoDB: {e}")
            raise
    return _client


def get_database():
    """Get the database instance."""
    return get_client()[DATABASE_NAME]


def get_collection(collection_name: str):
    """Get a specific collection."""
    return get_database()[collection_name]


def close_connection():
    """Close the MongoDB connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("[OK] MongoDB connection closed")


@contextmanager
def get_session():
    """Context manager for database sessions."""
    client = get_client()
    session = client.start_session()
    try:
        yield session
    finally:
        session.end_session()
