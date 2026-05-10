# Artellect AI – FastAPI Backend

In-memory FastAPI backend that powers the Artellect AI React frontend. Endpoints
match every call previously mocked in `Frontend/src/services/api.ts`.

## Setup

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs for interactive API docs.

## Endpoints

| Group     | Path                                             | Method |
|-----------|--------------------------------------------------|--------|
| Artworks  | `/api/artworks`                                  | GET    |
| Artworks  | `/api/artworks/featured`                         | GET    |
| Artworks  | `/api/artworks/trending`                         | GET    |
| Artworks  | `/api/artworks/search?q=...`                     | GET    |
| Artworks  | `/api/artworks/{id}`                             | GET    |
| Artists   | `/api/artists`                                   | GET    |
| Artists   | `/api/artists/trending`                          | GET    |
| Artists   | `/api/artists/{id}`                              | GET    |
| Artists   | `/api/artists/{id}/artworks`                     | GET    |
| Artists   | `/api/artists/{id}/follow`                       | POST   |
| Artists   | `/api/artists/{id}/unfollow`                     | POST   |
| Admin     | `/api/admin/users`                               | GET    |
| Admin     | `/api/admin/artworks`                            | GET    |
| Admin     | `/api/admin/verification-requests`               | GET    |
| Admin     | `/api/admin/verification-requests/{id}/approve`  | POST   |
| Admin     | `/api/admin/verification-requests/{id}/reject`   | POST   |
| Admin     | `/api/admin/artworks/{id}`                       | DELETE |
| Admin     | `/api/admin/users/{id}`                          | DELETE |
| Dashboard | `/api/dashboard/stats`                           | GET    |
| Dashboard | `/api/dashboard/listings`                        | GET    |
| Dashboard | `/api/dashboard/revenue`                         | GET    |
| Dashboard | `/api/dashboard/listings/{id}`                   | PATCH  |
| Dashboard | `/api/dashboard/listings/{id}`                   | DELETE |
| Chatbot   | `/api/chatbot/message`                           | POST   |
| Chatbot   | `/api/chatbot/suggest`                           | POST   |
| Cart      | `/api/cart/checkout`                             | POST   |
| Cart      | `/api/cart/validate-coupon`                      | POST   |
| Auth      | `/api/auth/login`                                | POST   |
| Auth      | `/api/auth/register`                             | POST   |
| Auth      | `/api/auth/me`                                   | GET    |

## Notes

- Storage is in-process (mutating `app/data.py`); restart drops state.
- CORS is open for `http://localhost:5173` and `4173` (Vite dev/preview).
- The frontend reads its base URL from `VITE_API_URL` (see `Frontend/.env`).
