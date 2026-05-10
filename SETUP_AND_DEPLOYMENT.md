# Artellect Backend & Frontend - Complete Setup & Deployment Guide

## Quick Start (Development)

### Backend Setup

```bash
# Navigate to backend
cd Backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Create virtual environment (Linux/Mac)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Create .env file (if needed)
# Default API: http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Project Structure

### Backend (`Backend/`)
```
Backend/
├── app/
│   ├── routers/              # API endpoints
│   ├── exceptions.py         # Custom exceptions
│   ├── logging_config.py     # Structured logging
│   ├── validation.py         # Input validation
│   ├── config.py             # Configuration
│   ├── security.py           # Password hashing & tokens
│   ├── schemas.py            # Pydantic models
│   ├── store.py              # JSON data store
│   ├── util.py               # Utilities
│   ├── deps.py               # Dependencies
│   └── main.py               # FastAPI app
├── data/
│   └── store.json            # Data persistence
├── requirements.txt
├── .env.example
└── README.md
```

### Frontend (`Frontend/`)
```
Frontend/
├── src/
│   ├── components/           # React components
│   ├── pages/                # Page components
│   ├── hooks/                # Custom hooks (useAsync, useMutation, etc)
│   ├── services/             # API client
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript types
│   ├── utils/                # Utilities (error handling)
│   ├── locales/              # i18n translations
│   └── data/                 # Mock data & constants
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Backend Architecture

### Error Handling

Custom exception hierarchy for consistent error responses:

```python
from app.exceptions import NotFoundError, ValidationError

# Usage
raise NotFoundError("Artwork", artwork_id)
raise ValidationError("Invalid input", {"email": ["Invalid format"]})
```

All exceptions return structured JSON:
```json
{
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "data": {
    "error_id": "abc12345",
    "errors": {}
  }
}
```

### Logging

Structured JSON logging throughout:

```python
from app.logging_config import get_logger

log = get_logger("module_name")
log.info("User logged in", extra={"user_id": user["id"]})
```

All requests include unique request ID for tracing.

### Validation

Centralized input validation:

```python
from app.validation import validate_user_data, validate_artwork_data

validate_user_data(name, email, password)
validate_artwork_data(title, price, category)
```

### Database

Currently JSON-file based (`app/data/store.json`). Future migration to PostgreSQL:

```python
# Configured via environment variables
ARTELLECT_DATA_DIR=./Backend/app/data
ARTELLECT_UPLOAD_DIR=./Backend/app/uploads
```

---

## Frontend Architecture

### State Management (Zustand)

Multiple stores for different domains:

```typescript
// Auth store
useAuthStore.getState().login(email, password)
useAuthStore.getState().logout()

// Cart store
useCartStore.getState().addItem(artwork, quantity)
useCartStore.getState().checkout()

// Chat store
useChatStore.getState().sendMessage(message)

// UI store
useUIStore.getState().setTheme('dark')
useUIStore.getState().setLanguage('es')
```

### Custom Hooks

Reusable async patterns:

```typescript
// Data fetching
const { data, loading, error, retry } = useAsync(
  () => artworkAPI.getFeatured(),
  [],
  { autoFetch: true }
)

// Mutations (POST/PATCH/DELETE)
const { execute, loading, error } = useMutation(
  (data) => artworkAPI.like(artwork_id),
  { onSuccess: () => {} }
)

// Pagination
const { data, page, nextPage, prevPage } = usePaginatedAsync(
  (page) => artworkAPI.list({ page }),
  10
)
```

### Error Handling

Centralized error utilities:

```typescript
import { getErrorMessage, shouldLogout } from '@/utils/errors'

// Convert API errors to user-friendly messages
const message = getErrorMessage(error)

// Check if error requires logout
if (shouldLogout(error)) {
  useAuthStore.getState().logout()
}
```

### API Integration

Axios-based API client with interceptors:

```typescript
import { artworkAPI, authAPI } from '@/services/api'

// All requests include auth token automatically
// 401 errors trigger logout
// Errors are formatted to ApiError structure
```

---

## Environment Variables

### Backend

Create `.env` file in `Backend/` directory:

```env
DEBUG=false
LOG_LEVEL=INFO
ARTELLECT_SECRET_KEY=<strong-random-key>
ARTELLECT_DATA_DIR=./Backend/app/data
ARTELLECT_UPLOAD_DIR=./Backend/app/uploads
ARTELLECT_CORS=http://localhost:5173,https://yourdomain.com
RATE_LIMIT_ENABLED=false
MAX_UPLOAD_SIZE=10485760
```

### Frontend

Environment variables are optional. Backend URL defaults to `http://localhost:8000`:

```env
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/me` - Delete account

### Artworks
- `GET /api/artworks` - List with filters
- `GET /api/artworks/featured` - Featured artworks
- `GET /api/artworks/trending` - Trending artworks
- `GET /api/artworks/search?q=...` - Search
- `GET /api/artworks/{id}` - Get artwork
- `POST /api/artworks` - Create (requires auth)
- `PATCH /api/artworks/{id}` - Update (requires auth)
- `DELETE /api/artworks/{id}` - Delete (requires auth)

### Artists
- `GET /api/artists` - List artists
- `GET /api/artists/trending` - Trending artists
- `GET /api/artists/{id}` - Get artist
- `POST /api/artists/{id}/follow` - Follow artist
- `POST /api/artists/{id}/unfollow` - Unfollow artist

### Users
- `GET /api/users/{id}` - Get user profile
- `PATCH /api/users/me` - Update profile
- `GET /api/users/me/settings` - Get settings
- `PUT /api/users/me/settings` - Update settings

### Cart & Orders
- `POST /api/cart/validate-coupon` - Validate coupon
- `POST /api/cart/checkout` - Checkout
- `GET /api/orders` - List orders
- `GET /api/orders/{id}` - Get order

### Dashboard
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/dashboard/listings` - User's listings
- `PATCH /api/dashboard/listings/{id}` - Update listing

### Admin
- `GET /api/admin/users` - List users (admin)
- `GET /api/admin/artworks` - List artworks (admin)
- `DELETE /api/admin/artworks/{id}` - Delete artwork (admin)

---

## Production Deployment

### Backend (Gunicorn)

```bash
# Install production dependencies
pip install gunicorn python-dotenv

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 --access-logfile - app.main:app
```

### Frontend (Build & Serve)

```bash
# Build for production
npm run build

# Output in dist/ directory
# Serve with any static file server (nginx, Apache, etc)
```

### Nginx Configuration Example

```nginx
upstream backend {
    server localhost:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    root /var/www/artellect/dist;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
    }
}
```

### Database Migration (Future)

When migrating from JSON to PostgreSQL:

1. Create PostgreSQL database
2. Update `app/store.py` to use SQLAlchemy
3. Update `ARTELLECT_DATA_DIR` to DB connection string
4. Run migrations
5. Test with development server

---

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Modify router files or utilities
   - Add validation if accepting new input
   - Use custom exceptions for errors
   - Reload dev server (automatic with --reload)

2. **Frontend Changes**
   - Modify components/pages
   - Update API calls in services
   - Use custom hooks for async logic
   - Hot reload works with Vite

### Adding New Features

**Backend:**
1. Create schema in `schemas.py`
2. Add validation in `validation.py`
3. Create endpoint in appropriate router
4. Use exception hierarchy for errors
5. Add structured logging

**Frontend:**
1. Create component in appropriate folder
2. Add API client in `services/api.ts`
3. Use custom hooks for data fetching
4. Add type definitions in `types/index.ts`
5. Use error utilities for error handling

### Testing

**Backend:**
```bash
# Can use pytest
pip install pytest pytest-asyncio

# Create tests/test_auth.py
# Run: pytest
```

**Frontend:**
```bash
# Can use Vitest
npm install -D vitest

# Create tests in __tests__ folders
# Run: npm run test
```

---

## Troubleshooting

### Backend Issues

**"Address already in use"**
- Port 8000 already in use
- Kill process: `lsof -i :8000` then `kill -9 <PID>`
- Or use different port: `uvicorn app.main:app --port 8001`

**CORS errors**
- Update `ARTELLECT_CORS` in `.env`
- Make sure frontend URL matches exactly

**"Module not found"**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt`

### Frontend Issues

**"Cannot find module"**
- Run `npm install`
- Check tsconfig paths in `tsconfig.json`

**"API is undefined"**
- Make sure backend is running on port 8000
- Check `VITE_API_URL` environment variable
- Check network tab in DevTools for actual request

**"Token not found"**
- Local storage is cleared
- Login again
- Check localStorage in DevTools

---

## Performance Optimization

### Backend
- Add database with proper indexing (PostgreSQL)
- Implement caching layer (Redis)
- Add rate limiting middleware
- Use async/await throughout
- Paginate large result sets

### Frontend
- Code splitting with React.lazy()
- Image optimization with loading="lazy"
- Memoization with React.memo()
- State optimization to prevent re-renders
- Bundle size monitoring

---

## Security Checklist

### Backend
- [ ] Update SECRET_KEY in production
- [ ] Use HTTPS in production
- [ ] Set DEBUG=false in production
- [ ] Configure CORS to specific domains
- [ ] Validate all user input
- [ ] Hash passwords properly (PBKDF2)
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Implement CSRF protection if needed
- [ ] Add input/output sanitization

### Frontend
- [ ] Use environment variables for API URL
- [ ] Validate form input before sending
- [ ] Don't store sensitive data in localStorage
- [ ] Use HTTPS only in production
- [ ] Implement Content Security Policy
- [ ] Regular dependency updates
- [ ] Remove console.logs in production
- [ ] Sanitize user-generated content

---

## Monitoring

### Logging
- All requests logged with request ID
- Errors logged with error ID
- Performance metrics in logs (duration_ms)
- View at `/health` endpoint

### Health Check
```bash
curl http://localhost:8000/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "stats": {
    "users": 0,
    "artworks": 0,
    "artists": 0
  }
}
```

---

## Next Steps

1. **Immediate**
   - Test backend APIs with Swagger UI
   - Test frontend with backend
   - Fix any integration issues

2. **Short Term**
   - Add comprehensive error tests
   - Implement rate limiting
   - Add caching for performance

3. **Medium Term**
   - Migrate to PostgreSQL
   - Add Redis for sessions
   - Implement payment processing

4. **Long Term**
   - Add GraphQL API
   - Add WebSocket for real-time chat
   - Add background jobs (Celery)
   - Add file storage (S3)

---

## Support

For issues or questions:
1. Check the documentation in `BACKEND_IMPROVEMENTS.md` and `INTEGRATION_GUIDE.md`
2. Review API documentation at `/docs`
3. Check console logs and backend logs
4. Search GitHub issues or create new one

