# MongoDB Setup Guide for FYP Backend

## Overview
This backend is now configured to use MongoDB Atlas for data persistence. The setup includes connection pooling, automatic initialization, and fallback to in-memory data if MongoDB is unavailable.

## Files Created/Modified

### New Files:
1. **`app/database.py`** - MongoDB connection configuration
   - Manages client connections
   - Provides collection access
   - Includes context managers for sessions

2. **`app/models.py`** - Pydantic models for MongoDB documents
   - Artist, Artwork, User, VerificationRequest models
   - Custom ObjectId handling for MongoDB

3. **`.env`** - Environment variables
   - MongoDB URI (already configured)
   - Database name
   - Debug and logging settings

### Modified Files:
1. **`app/store.py`** - Replaced JSON file storage with MongoDB
   - `initialize()` - Seeds collections if empty
   - `db()` - Returns database wrapper for compatibility
   - Automatic index creation

2. **`app/main.py`** - Added MongoDB initialization
   - Connects to MongoDB on startup
   - Graceful fallback if connection fails
   - Cleanup on shutdown

3. **`requirements.txt`** - Updated dependencies
   - Added `pymongo[srv]==4.10.1` for MongoDB driver
   - Added `python-dotenv==1.0.0` for environment variables

## Installation & Setup

### 1. Install Dependencies
```bash
cd FYP_frontened/Backend
pip install -r requirements.txt
```

### 2. Verify MongoDB Connection
The `.env` file already contains your MongoDB URI. To test the connection:
```bash
python -c "from app.database import get_client; get_client()"
```

You should see: `✓ Successfully connected to MongoDB!`

### 3. Initialize Database
Collections are automatically initialized on first app startup. If you need to manually reset:
```python
from app.store import reset
reset()  # Wipes collections and reloads seed data
```

## Usage in Your Routes

### Example: Updating to Use MongoDB in Routes

Before (JSON file):
```python
artist = find_artist(artist_id)
artist["followers"] += 1
store.save()
```

After (MongoDB):
```python
from app.database import get_collection
artists = get_collection("artists")
artists.update_one(
    {"id": artist_id},
    {"$inc": {"followers": 1}}
)
```

### Accessing Collections
```python
from app.database import get_collection

users = get_collection("users")
artworks = get_collection("artworks")
artists = get_collection("artists")
```

## Database Schema

### Collections:
- **users** - User accounts and authentication
- **artists** - Artist profiles
- **artworks** - Art pieces and listings
- **listings** - Art marketplace listings
- **verification_requests** - Artist verification requests
- **revenue** - Revenue tracking data

## Performance Optimizations

The following indexes are automatically created:
- `users.email` (unique)
- `artworks.artistId`
- `artists.id` (sparse)

## Troubleshooting

### Connection Issues
If MongoDB connection fails:
1. Check MongoDB URI in `.env` is correct
2. Verify network access is allowed in MongoDB Atlas
3. Check your IP address is whitelisted in Atlas

### Import Errors
If you get `ModuleNotFoundError: No module named 'pymongo'`:
```bash
pip install pymongo[srv]
```

### ObjectId Errors
If working with MongoDB ObjectIds:
```python
from bson import ObjectId
from app.models import PyObjectId

# Convert string to ObjectId
obj_id = ObjectId(string_id)

# Use PyObjectId in Pydantic models
```

## Environment Variables

Create a `.env` file with:
```
MONGO_URI=your_mongodb_uri_here
DATABASE_NAME=art_marketplace
DEBUG=False
LOG_LEVEL=INFO
```

The app will load these automatically via `python-dotenv`.

## Next Steps

1. Update individual route handlers to use MongoDB queries
2. Add transaction support for multi-document operations
3. Implement aggregation pipelines for analytics
4. Add caching layer (Redis) for frequently accessed data
