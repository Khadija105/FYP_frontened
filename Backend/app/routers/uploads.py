import os
import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from .. import config
from ..deps import current_user
from ..schemas import UploadResponse

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf"}
MAX_BYTES = 8 * 1024 * 1024  # 8MB


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    _: dict = Depends(current_user),
):
    ext = Path(file.filename or "").suffix.lower() or ".bin"
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Extension {ext} not allowed")

    safe_name = f"{secrets.token_urlsafe(12)}{ext}"
    dest = config.UPLOAD_DIR / safe_name

    size = 0
    with dest.open("wb") as out:
        while chunk := await file.read(64 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                out.close()
                os.remove(dest)
                raise HTTPException(status_code=413, detail="File too large (max 8MB)")
            out.write(chunk)

    public_url = f"{request.base_url}uploads/{safe_name}".rstrip("/")
    return {"url": public_url, "filename": safe_name, "size": size}
