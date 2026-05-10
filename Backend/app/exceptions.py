"""
Professional exception handling and error responses.
All API errors should use these classes for consistent error handling.
"""

from typing import Any, Optional
from fastapi import HTTPException, status


class APIError(HTTPException):
    """Base API exception with consistent response format"""
    
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "Internal server error",
        code: str = "INTERNAL_ERROR",
        data: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ):
        self.code = code
        self.data = data or {}
        detail_dict = {
            "message": detail,
            "code": code,
            "data": self.data,
        }
        super().__init__(status_code=status_code, detail=detail_dict, headers=headers)


class ValidationError(APIError):
    """Raised when request validation fails"""
    
    def __init__(self, detail: str = "Validation failed", errors: Optional[dict[str, list[str]]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            code="VALIDATION_ERROR",
            data={"errors": errors or {}},
        )


class AuthenticationError(APIError):
    """Raised when authentication fails"""
    
    def __init__(self, detail: str = "Authentication required"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="AUTHENTICATION_FAILED",
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(APIError):
    """Raised when user lacks required permissions"""
    
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="AUTHORIZATION_FAILED",
        )


class NotFoundError(APIError):
    """Raised when a resource is not found"""
    
    def __init__(self, resource: str = "Resource", resource_id: Optional[str] = None):
        detail = f"{resource} not found"
        if resource_id:
            detail += f" (ID: {resource_id})"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            code="NOT_FOUND",
            data={"resource": resource, "id": resource_id},
        )


class ConflictError(APIError):
    """Raised when a resource already exists or conflicts"""
    
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="CONFLICT",
        )


class RateLimitError(APIError):
    """Raised when rate limit is exceeded"""
    
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            code="RATE_LIMIT_EXCEEDED",
        )


class InternalServerError(APIError):
    """Raised for internal server errors"""
    
    def __init__(self, detail: str = "Internal server error", error_id: Optional[str] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            code="INTERNAL_SERVER_ERROR",
            data={"error_id": error_id},
        )
