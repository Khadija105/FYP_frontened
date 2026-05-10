# How to Add Artworks to Artellect

## Method 1: Using API (POST Request)

### Step 1: Register/Login to get token
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com",
    "password": "password123"
  }'
```

This returns:
```json
{
  "user": {...},
  "token": "your-jwt-token-here"
}
```

### Step 2: Create Artwork using token
```bash
curl -X POST http://localhost:8000/api/artworks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -d '{
    "title": "My Amazing Artwork",
    "description": "A beautiful piece of art",
    "image": "https://images.unsplash.com/photo-XXXXXX?w=800&h=800&fit=crop",
    "price": 2500,
    "category": "Digital Art",
    "tags": ["abstract", "digital", "art"],
    "story": {
      "statement": "This artwork represents...",
      "process": "I created this by...",
      "inspiration": "Inspired by..."
    }
  }'
```

---

## Method 2: Add Seed Data (Development)

Edit `/Backend/app/data.py` and add to the ARTWORKS list:

```python
ARTWORKS = [
    # ... existing artworks ...
    {
        "id": "art9",
        "title": "Your Artwork Title",
        "artistId": "artist1",  # Which artist created it
        "image": "https://images.unsplash.com/photo-XXXXXX?w=800&h=800&fit=crop",
        "price": 2500,
        "category": "Digital Art",
        "tags": ["abstract", "modern"],
        "description": "Description of the artwork",
        "story": {
            "statement": "Artist statement here",
            "process": "Creative process description",
            "inspiration": "What inspired this work"
        },
        "youtubeUrl": None,
        "createdAt": "2026-05-10",
        "likes": 0,
        "likedBy": []
    }
]
```

Then restart the backend:
```bash
# Kill current backend (Ctrl+C)
# Restart:
cd Backend
python -m uvicorn app.main:app --reload
```

---

## Method 3: Create Frontend Form (Full Implementation)

You need to create an "Add Artwork" page/modal with a form that calls the API.

### Frontend Implementation:

1. **Create form component** (if not exists):
```typescript
// Frontend/src/pages/AddArtwork.tsx
import { useState } from "react";
import { artworkAPI } from "../services/api";

export const AddArtwork = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    price: 0,
    category: "Digital Art",
    tags: [],
    story: {
      statement: "",
      process: "",
      inspiration: ""
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await artworkAPI.create({
        ...formData,
        image: formData.image // URL or base64
      });
      // Show success and redirect
    } catch (error) {
      // Show error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Artwork Title"
      />
      {/* ... more form fields ... */}
      <button type="submit">Add Artwork</button>
    </form>
  );
};
```

2. **Add route** (in App.tsx):
```typescript
import { AddArtwork } from "./pages/AddArtwork";

<Route path="/add-artwork" element={<AddArtwork />} />
```

3. **Add navigation link**:
```typescript
{isAuthenticated && (
  <Link to="/add-artwork">Add Your Artwork</Link>
)}
```

---

## Image URLs

For testing, use free image URLs from:
- **Unsplash:** https://images.unsplash.com/photo-XXXXX
- **Pexels:** https://images.pexels.com/photos/XXXXX
- **Your own:** Upload and get a URL

Example Unsplash URLs (high quality art images):
- `https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=800&fit=crop` (abstract)
- `https://images.unsplash.com/photo-1578926078328-cbf4f8d0f8c0?w=800&h=800&fit=crop` (colorful)
- `https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=800&fit=crop` (dark)

---

## Example Complete Artwork Object

```json
{
  "title": "Neon Dreams",
  "description": "A vibrant digital artwork exploring urban nightlife",
  "image": "https://images.unsplash.com/photo-1578926078328-cbf4f8d0f8c0?w=800&h=800&fit=crop",
  "price": 1800,
  "category": "Digital Art",
  "tags": ["neon", "urban", "digital", "vibrant"],
  "story": {
    "statement": "Art is the expression of the digital age",
    "process": "Created using digital painting tools and effects",
    "inspiration": "Inspired by cyberpunk aesthetics and neon lights"
  }
}
```

---

## Categories Available

- Digital Art
- Abstract
- Minimalism
- Photography
- Illustration
- 3D Art
- Mixed Media

---

## Quick Test: Add Artwork via Python Script

```python
# test_add_artwork.py
import requests
import json

# 1. Register
register_response = requests.post(
    "http://localhost:8000/api/auth/register",
    json={
        "name": "Test Artist",
        "email": "artist@test.com",
        "password": "password123"
    }
)
token = register_response.json()["token"]

# 2. Create Artwork
artwork_data = {
    "title": "My First NFT",
    "description": "Testing the API",
    "image": "https://images.unsplash.com/photo-1578926078328-cbf4f8d0f8c0?w=800&h=800&fit=crop",
    "price": 3000,
    "category": "Digital Art",
    "tags": ["test", "api"],
    "story": {
        "statement": "Testing statement",
        "process": "API testing",
        "inspiration": "Learning the system"
    }
}

create_response = requests.post(
    "http://localhost:8000/api/artworks",
    headers={"Authorization": f"Bearer {token}"},
    json=artwork_data
)

print("Created artwork:")
print(json.dumps(create_response.json(), indent=2))
```

Run with:
```bash
python test_add_artwork.py
```

---

## What You'll See

After adding an artwork, it will immediately appear in:
- ✅ Browse page (/browse)
- ✅ Search results (if you search for keywords)
- ✅ Category filter
- ✅ Trending artworks (once it gets likes)

---

## Notes

- Artwork IDs are auto-generated (art1, art2, etc.)
- Images must be valid URLs
- Authenticated users can only create artworks if they have "artist" or "admin" role
- By default, new users get "user" role
- To change role, edit the backend database directly or create an admin endpoint
