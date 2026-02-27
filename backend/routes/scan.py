import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from services.recon_service import run_recon
from services.db_service import save_scan, get_scan

router = APIRouter()


class ScanRequest(BaseModel):
    domain: str

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Domain cannot be empty")
        # Basic domain format validation
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
    try:
        assets = run_recon(request.domain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recon scan failed: {str(e)}")

    try:
        result = save_scan(
            domain=request.domain,
            assets=assets,
            total_assets=len(assets),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save scan: {str(e)}")

    return {
        "scan_id": result["scan_id"],
        "domain": result["domain"],
        "total_assets": result["total_assets"],
        "assets": result["assets"],
    }


@router.get("/scan/{scan_id}")
def get_scan_result(scan_id: str):
    """
    Retrieve a previously stored scan result by its ID.
    """
    result = get_scan(scan_id)

    if not result:
        raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")

    return {
        "scan_id": result["scan_id"],
        "domain": result["domain"],
        "total_assets": result["total_assets"],
        "assets": result["assets"],
    }
