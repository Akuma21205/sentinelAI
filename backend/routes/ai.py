from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.db_service import get_scan
from services.ai_service import generate_summary, generate_attack_simulation

router = APIRouter()


class AIRequest(BaseModel):
    scan_id: str


@router.post("/summary")
def get_summary(request: AIRequest):
    """
    Generate an AI-powered executive summary for a completed scan.
    Uses preprocessed structured data + Groq API for accurate analysis.
    """
    scan = get_scan(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {request.scan_id}")

    try:
        result = generate_summary(
            domain=scan["domain"],
            assets=scan["assets"],
        )
        return result
    except Exception as e:
        # Structured fallback instead of raw 500
        return {
            "summary": f"AI analysis unavailable: {str(e)}",
            "top_risks": ["Unable to generate risk analysis — AI service error"],
            "recommendations": ["Retry analysis or review scan results manually"],
        }


@router.post("/simulate")
def simulate_attack(request: AIRequest):
    """
    Generate a simulated attack chain based on scan results.
    Only considers assets with risk_score >= 30.
    """
    scan = get_scan(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {request.scan_id}")

    try:
        simulation = generate_attack_simulation(
            domain=scan["domain"],
            assets=scan["assets"],
        )
        return {"attack_simulation": simulation}
    except Exception as e:
        # Structured fallback
        return {
            "attack_simulation": f"Attack simulation unavailable: {str(e)}. Please retry or review scan data manually."
        }
