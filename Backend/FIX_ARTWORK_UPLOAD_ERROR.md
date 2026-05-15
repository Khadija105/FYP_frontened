# Fix: "Request failed with status code 403" on Artwork Upload

## The Problem

When you try to upload/create an artwork, you get:
```
Request failed with status code 403
```

This means your user account is a regular **"user"** but only **"artist"** or **"admin"** roles can create artworks.

---

## Solution: Become an Artist

You need to upgrade your user role to "artist" first.

### Option 1: Via Frontend UI (Recommended)
1. Go to **Settings** or **Profile** page
2. Look for **"Become an Artist"** button
3. Click it to upgrade your role
4. Now you can create artworks

### Option 2: Via API (Using cURL)

First, get your auth token:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

Response will include a `token`. Copy it and use it here:

```bash
curl -X POST http://localhost:8000/api/users/me/become-artist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Via Browser Console

```javascript
// Login first
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Now become an artist
const artistResponse = await fetch('http://localhost:8000/api/users/me/become-artist', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`}
});

const artistData = await artistResponse.json();
console.log('Upgraded to artist:', artistData);
```

---

## Test Users (Pre-configured as Artists)

You can use these test accounts that are already artists:

**Email:** `sophia@example.com`  
**Password:** `password`

This user is already an artist and can create artworks immediately.

---

## After Upgrading to Artist

Once you become an artist:
1. ✅ You can create artworks
2. ✅ You can edit your artworks
3. ✅ You can delete your artworks
4. ✅ Other users can follow you
5. ✅ You have a follower count

---

## Verify Your Role

Check your current user role:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Look for `"role": "artist"` in the response.

---

## API Endpoints Related to Artist Role

**Become Artist:**
```
POST /api/users/me/become-artist
```

**Get User Profile (shows role):**
```
GET /api/users/me/profile
```

**Create Artwork (requires artist role):**
```
POST /api/artworks
```

---

## Troubleshooting

### Still Getting 403 After Becoming Artist?
1. **Refresh the page** - Token might be cached
2. **Clear localStorage** - Remove old tokens
3. **Re-login** - Get a fresh token

### "Already an artist" Error
You're already an artist! Try creating an artwork now.

### "Admins cannot change their role" Error
You're an admin account and can create artworks anyway. The error is just a safety check.

---

## Complete Workflow to Upload Artwork

```javascript
// 1. Register or Login
const auth = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'test@example.com', password: 'test'})
}).then(r => r.json());

const token = auth.token;

// 2. Become an artist
await fetch('http://localhost:8000/api/users/me/become-artist', {
  method: 'POST',
  headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json());

console.log('You are now an artist!');

// 3. Create an artwork
const artwork = await fetch('http://localhost:8000/api/artworks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Artwork',
    description: 'Description here',
    image: 'https://picsum.photos/800/800',
    price: 2500,
    category: 'Digital Art',
    tags: ['abstract', 'modern'],
    artistId: auth.user.id
  })
}).then(r => r.json());

console.log('Artwork created:', artwork);
```

---

## Quick Test with Pre-made Artist Account

```bash
# Login as artist
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sophia@example.com","password":"password"}' \
  | jq .token
```

This will return a token you can use to create artworks immediately.

---

## Summary

| User Type | Can Create Artworks | Can Edit Own | Can Delete Own |
|-----------|-------------------|-------------|----------------|
| Regular User | ❌ No | ❌ No | ❌ No |
| Artist | ✅ Yes | ✅ Yes | ✅ Yes |
| Admin | ✅ Yes | ✅ All | ✅ All |

**Current Status:** Regular User → Need to upgrade to Artist

**Action Required:** Click "Become an Artist" button in settings
