import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("ARTELLECT_DATA_DIR", ROOT / "data"))
UPLOAD_DIR = Path(os.getenv("ARTELLECT_UPLOAD_DIR", ROOT / "uploads"))
STORE_FILE = DATA_DIR / "store.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "ARTELLECT_CORS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
    ).split(",")
    if o.strip()
]
