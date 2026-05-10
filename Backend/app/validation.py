"""
Validation utilities for request data.
Provides consistent validation across all endpoints.
"""

import re
from typing import Optional

from .exceptions import ValidationError


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength.
    Returns (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    # Could add more rules: uppercase, numbers, special chars, etc.
    return True, None


def validate_user_data(
    name: str,
    email: str,
    password: Optional[str] = None,
) -> None:
    """Validate user registration/update data"""
    errors: dict[str, list[str]] = {}
    
    # Validate name
    if not name or len(name.strip()) == 0:
        errors.setdefault("name", []).append("Name is required")
    elif len(name) > 80:
        errors.setdefault("name", []).append("Name must be less than 80 characters")
    
    # Validate email
    if not email or not validate_email(email):
        errors.setdefault("email", []).append("Invalid email format")
    
    # Validate password if provided
    if password is not None:
        is_valid, error_msg = validate_password_strength(password)
        if not is_valid:
            errors.setdefault("password", []).append(error_msg)
    
    if errors:
        raise ValidationError("User data validation failed", errors)


def validate_artwork_data(
    title: str,
    price: float,
    category: str,
) -> None:
    """Validate artwork data"""
    errors: dict[str, list[str]] = {}
    
    # Validate title
    if not title or len(title.strip()) == 0:
        errors.setdefault("title", []).append("Title is required")
    elif len(title) > 200:
        errors.setdefault("title", []).append("Title must be less than 200 characters")
    
    # Validate price
    if price < 0:
        errors.setdefault("price", []).append("Price cannot be negative")
    if price > 1000000:
        errors.setdefault("price", []).append("Price cannot exceed $1,000,000")
    
    # Validate category
    valid_categories = ["Digital Art", "Photography", "Abstract", "Sculpture", "Mixed Media"]
    if category not in valid_categories:
        errors.setdefault("category", []).append(
            f"Category must be one of: {', '.join(valid_categories)}"
        )
    
    if errors:
        raise ValidationError("Artwork data validation failed", errors)


def validate_comment(text: str) -> None:
    """Validate comment data"""
    errors: dict[str, list[str]] = {}
    
    if not text or len(text.strip()) == 0:
        errors.setdefault("text", []).append("Comment cannot be empty")
    elif len(text) < 1:
        errors.setdefault("text", []).append("Comment must be at least 1 character")
    elif len(text) > 2000:
        errors.setdefault("text", []).append("Comment must be less than 2000 characters")
    
    if errors:
        raise ValidationError("Comment validation failed", errors)


def validate_coupon(code: str) -> None:
    """Validate coupon code format"""
    errors: dict[str, list[str]] = {}
    
    if not code or len(code.strip()) == 0:
        errors.setdefault("code", []).append("Coupon code is required")
    elif len(code) > 50:
        errors.setdefault("code", []).append("Coupon code must be less than 50 characters")
    
    if errors:
        raise ValidationError("Coupon validation failed", errors)
