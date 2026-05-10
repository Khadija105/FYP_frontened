"""
Structured logging configuration for the application.
All logs follow a consistent format for better debugging and monitoring.
"""

import json
import logging
import sys
import traceback
import uuid
from datetime import datetime
from typing import Any, Optional

# ANSI color codes for terminal output
RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
GRAY = "\033[90m"


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logging output"""
    
    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Build the log entry
        log_entry = {
            "timestamp": timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info),
            }
        
        # Add extra fields
        if hasattr(record, "extra_data"):
            log_entry["data"] = record.extra_data
        
        return json.dumps(log_entry, default=str)


def configure_logging(level: int = logging.INFO) -> logging.Logger:
    """Configure structured logging for the application"""
    
    logger = logging.getLogger("artellect")
    logger.setLevel(level)
    
    # Console handler with structured format
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    formatter = StructuredFormatter()
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    logger.propagate = False
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a module"""
    return logging.getLogger(f"artellect.{name}")


def log_event(
    logger: logging.Logger,
    level: int,
    message: str,
    **kwargs: Any
) -> None:
    """Log an event with structured data"""
    record = logger.makeRecord(
        logger.name,
        level,
        "(unknown file)",
        0,
        message,
        (),
        None,
    )
    record.extra_data = kwargs
    logger.handle(record)


def log_request(
    logger: logging.Logger,
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    **kwargs: Any
) -> None:
    """Log an HTTP request"""
    log_event(
        logger,
        logging.INFO,
        f"{method} {path}",
        method=method,
        path=path,
        status_code=status_code,
        duration_ms=duration_ms,
        **kwargs,
    )


def generate_error_id() -> str:
    """Generate a unique error ID for tracking"""
    return str(uuid.uuid4())[:8]
