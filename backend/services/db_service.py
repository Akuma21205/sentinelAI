"""
Database Service — MongoDB persistence with structured error handling.

All database operations return structured results.
Stack traces are logged but never exposed to callers.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from core.config import MONGO_URI

logger = logging.getLogger("db_service")

_client: Optional[MongoClient] = None
_db = None


class DatabaseError(Exception):
    """Structured database error — safe to expose to API callers."""
    def __init__(self, message: str, code: str = "DB_ERROR"):
        super().__init__(message)
        self.code = code
        self.message = message


def _get_db():
    """Lazy-initialize the MongoDB connection with structured error handling."""
    global _client, _db
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            _client.server_info()
            _db = _client["attack_surface_db"]
            logger.info("MongoDB connection established")
        except ServerSelectionTimeoutError:
            logger.error("MongoDB connection timeout — check MONGO_URI")
            raise DatabaseError(
                "Database connection timed out. Please verify database availability.",
                code="DB_TIMEOUT",
            )
        except ConnectionFailure as e:
            logger.error("MongoDB connection failure: %s", str(e))
            raise DatabaseError(
                "Database connection failed. Please check configuration.",
                code="DB_CONNECTION_FAILED",
            )
        except Exception as e:
            logger.error("MongoDB unexpected error: %s", str(e))
            raise DatabaseError(
                "Database service is temporarily unavailable.",
                code="DB_UNAVAILABLE",
            )
    return _db


def save_scan(domain: str, assets: list, total_assets: int) -> Dict[str, Any]:
    """
    Save scan results to MongoDB.
    Returns the saved document with string scan_id.
    Raises DatabaseError on failure.
    """
    try:
        db = _get_db()
    except DatabaseError:
        raise

    doc = {
        "domain": domain,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "assets": assets,
        "total_assets": total_assets,
        "risk_summary": {
            "critical": sum(1 for a in assets if a.get("severity") == "Critical"),
            "high": sum(1 for a in assets if a.get("severity") == "High"),
            "medium": sum(1 for a in assets if a.get("severity") == "Medium"),
            "low": sum(1 for a in assets if a.get("severity") == "Low"),
            "informational": sum(1 for a in assets if a.get("severity") == "Informational"),
        },
    }

    try:
        result = db.scans.insert_one(doc)
        doc["scan_id"] = str(result.inserted_id)
        doc.pop("_id", None)
        logger.info("Scan saved: %s (%s, %d assets)", doc["scan_id"], domain, total_assets)
        return doc
    except Exception as e:
        logger.error("Failed to save scan for %s: %s", domain, str(e))
        raise DatabaseError(
            "Failed to save scan results. Please try again.",
            code="DB_WRITE_FAILED",
        )


def get_scan(scan_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a scan result from MongoDB by its ID.
    Returns None if not found. Raises DatabaseError on connection issues.
    """
    try:
        db = _get_db()
    except DatabaseError:
        raise

    try:
        oid = ObjectId(scan_id)
    except Exception:
        logger.warning("Invalid scan_id format: %s", scan_id)
        return None

    try:
        doc = db.scans.find_one({"_id": oid})
    except Exception as e:
        logger.error("Failed to retrieve scan %s: %s", scan_id, str(e))
        raise DatabaseError(
            "Failed to retrieve scan results. Please try again.",
            code="DB_READ_FAILED",
        )

    if not doc:
        return None

    doc["scan_id"] = str(doc.pop("_id"))
    return doc
