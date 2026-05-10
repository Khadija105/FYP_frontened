import os
from pathlib import Path

# Paths
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("ARTELLECT_DATA_DIR", ROOT / "data"))
UPLOAD_DIR = Path(os.getenv("ARTELLECT_UPLOAD_DIR", ROOT / "uploads"))
STORE_FILE = DATA_DIR / "store.json"

# Create directories if they don't exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Security
SECRET_KEY = os.getenv("ARTELLECT_SECRET_KEY", "dev-secret-key-change-in-production")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# API Configuration
API_TITLE = "Artellect AI Backend"
API_VERSION = "2.0.0"
API_DESCRIPTION = "Production-ready FastAPI backend for the Artellect AI marketplace"

# CORS Configuration
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ARTELLECT_CORS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180,http://localhost:4173,http://localhost:3000",
    ).split(",")
    if o.strip()
]

# Rate limiting
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "false").lower() == "true"
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "60"))

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Upload configuration
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB default
ALLOWED_UPLOAD_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
}

# Email configuration (for future use)
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
