import re
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from services.recon_service import run_recon
from services.db_service import save_scan, get_scan, DatabaseError

logger = logging.getLogger("routes.scan")
router = APIRouter()


class ScanRequest(BaseModel):
    domain: str

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Domain cannot be empty")
        pattern = r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
        if not re.match(pattern, v):
            raise ValueError(f"Invalid domain format: {v}")
        return v


@router.post("/scan")
def scan_domain(request: ScanRequest):
    """
    Run a full attack surface scan on the given domain.
    Performs subdomain enumeration, DNS resolution, port scanning, and risk scoring.
    Results are persisted in MongoDB.
    """
    logger.info("Starting scan for domain: %s", request.domain)

    try:
        assets = run_recon(request.domain)
    except Exception as e:
        logger.error("Recon scan failed for %s: %s", request.domain, str(e))
        raise HTTPException(
            status_code=500,
            detail="Reconnaissance scan failed. Please verify the domain and try again.",
        )

    logger.info("Recon complete for %s: %d assets discovered", request.domain, len(assets))

    try:
        result = save_scan(
            domain=request.domain,
            assets=assets,
            total_assets=len(assets),
        )
    except DatabaseError as e:
        logger.error("Database error saving scan for %s: %s", request.domain, e.message)
        raise HTTPException(status_code=503, detail=e.message)
    except Exception as e:
        logger.error("Unexpected error saving scan for %s: %s", request.domain, str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to save scan results. Please try again.",
        )

    logger.info("Scan saved: %s (scan_id=%s)", request.domain, result["scan_id"])

    return {
        "scan_id": result["scan_id"],
        "domain": result["domain"],
        "total_assets": result["total_assets"],
        "assets": result["assets"],
    }


@router.get("/scan/{scan_id}")
def get_scan_result(scan_id: str):
    """Retrieve a previously stored scan result by its ID."""
    try:
        result = get_scan(scan_id)
    except DatabaseError as e:
        logger.error("Database error retrieving scan %s: %s", scan_id, e.message)
        raise HTTPException(status_code=503, detail=e.message)

    if not result:
        raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")

    return {
        "scan_id": result["scan_id"],
        "domain": result["domain"],
        "total_assets": result["total_assets"],
        "assets": result["assets"],
    }
