import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config, store
from .exceptions import APIError, InternalServerError, ValidationError
from .logging_config import configure_logging, get_logger, log_request
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

log = configure_logging()


def create_app() -> FastAPI:
    store.load()

    app = FastAPI(
        title="Artellect AI Backend",
        description="Production-ready FastAPI backend powering the Artellect AI marketplace.",
        version="2.0.0",
        docs_url="/docs",
        openapi_url="/openapi.json",
        redoc_url="/redoc",
    )

    # CORS Configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    # Exception handlers
    @app.exception_handler(APIError)
    async def api_error_handler(request: Request, exc: APIError):
        """Handle custom API errors"""
        log.warning(
            f"API Error: {exc.detail}",
            exc_info=True,
            extra={"request_id": request.headers.get("x-request-id")},
        )
        return JSONResponse(status_code=exc.status_code, content=exc.detail)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        """Handle request validation errors"""
        errors = {}
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"][1:])
            errors.setdefault(field, []).append(error["msg"])

        error_response = {
            "message": "Validation failed",
            "code": "VALIDATION_ERROR",
            "data": {"errors": errors},
        }
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=error_response)

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Handle unhandled exceptions"""
        error_id = str(uuid.uuid4())[:8]
        log.error(
            f"Unhandled exception (ID: {error_id})",
            exc_info=exc,
            extra={"request_id": request.headers.get("x-request-id")},
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "Internal server error",
                "code": "INTERNAL_SERVER_ERROR",
                "data": {"error_id": error_id},
            },
        )

    # Request/Response logging middleware
    @app.middleware("http")
    async def request_logging_middleware(request: Request, call_next):
        """Log all requests and responses"""
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start_time = time.time()
        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            log_request(
                log,
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
                request_id=request_id,
                query_params=dict(request.query_params),
            )

            response.headers["X-Request-ID"] = request_id
            return response
        except Exception as exc:
            duration_ms = (time.time() - start_time) * 1000
            log_request(
                log,
                request.method,
                request.url.path,
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                duration_ms,
                request_id=request_id,
                error=str(exc),
            )
            raise

    # Health check endpoint
    @app.get("/", tags=["health"])
    def root():
        """API root endpoint"""
        return {
            "name": "Artellect AI Backend",
            "status": "ok",
            "version": "2.0.0",
            "docs": "/docs",
            "health": "/health",
        }

    @app.get("/health", tags=["health"])
    def health():
        """Health check endpoint"""
        db = store.db()
        return {
            "status": "ok",
            "timestamp": time.time(),
            "stats": {
                "users": len(db.get("users", [])),
                "artworks": len(db.get("artworks", [])),
                "artists": len(db.get("artists", [])),
            },
        }

    # Mount static files
    app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")

    # Include routers
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
