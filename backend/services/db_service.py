from datetime import datetime, timezone
from typing import Dict, Any, Optional
from bson import ObjectId
from pymongo import MongoClient
from core.config import MONGO_URI

# MongoDB connection
_client: Optional[MongoClient] = None
_db = None


def _get_db():
    """Lazy-initialize the MongoDB connection."""
    global _client, _db
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Force connection test
            _client.server_info()
            _db = _client["attack_surface_db"]
        except Exception as e:
            raise Exception(f"Failed to connect to MongoDB: {str(e)}")
    return _db


def save_scan(domain: str, assets: list, total_assets: int) -> Dict[str, Any]:
    """
    Save scan results to MongoDB.
    Returns the saved document with string scan_id.
    """
    db = _get_db()

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

    result = db.scans.insert_one(doc)
    doc["scan_id"] = str(result.inserted_id)

    # Remove MongoDB's _id from the response
    doc.pop("_id", None)
    return doc


def get_scan(scan_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a scan result from MongoDB by its ID.
    Returns None if not found.
    """
    db = _get_db()

    try:
        doc = db.scans.find_one({"_id": ObjectId(scan_id)})
    except Exception:
        return None

    if not doc:
        return None

    doc["scan_id"] = str(doc.pop("_id"))
    return doc
