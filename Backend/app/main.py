import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config, store
from .routers import (
    admin,
    artists,
    artworks,
    auth,
    cart,
    chat,
    dashboard,
    extras,
    uploads,
    users,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
log = logging.getLogger("artellect")


def create_app() -> FastAPI:
    store.load()

    app = FastAPI(
        title="Artellect AI Backend",
        description="Production-ready FastAPI backend powering the Artellect AI marketplace.",
        version="2.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception(request: Request, exc: Exception):
        log.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    @app.middleware("http")
    async def access_log(request: Request, call_next):
        response = await call_next(request)
        log.info("%s %s -> %s", request.method, request.url.path, response.status_code)
        return response

    app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")

    @app.get("/", tags=["meta"])
    def root():
        return {"name": "Artellect AI Backend", "status": "ok", "docs": "/docs", "version": "2.0.0"}

    @app.get("/health", tags=["meta"])
    def health():
        db = store.db()
        return {
            "status": "ok",
            "users": len(db.get("users", [])),
            "artworks": len(db.get("artworks", [])),
            "artists": len(db.get("artists", [])),
        }

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(artworks.router)
    app.include_router(artists.router)
    app.include_router(cart.router)
    app.include_router(dashboard.router)
    app.include_router(admin.router)
    app.include_router(chat.router)
    app.include_router(uploads.router)
    app.include_router(extras.router)

    return app


app = create_app()
