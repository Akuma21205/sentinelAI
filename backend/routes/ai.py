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
    Uses Groq API to analyze scan results and provide insights.
    """
    scan = get_scan(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {request.scan_id}")

    try:
        result = generate_summary(
            domain=scan["domain"],
            assets=scan["assets"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI summary generation failed: {str(e)}")

    return result


@router.post("/simulate")
def simulate_attack(request: AIRequest):
    """
    Generate a simulated attack chain based on scan results.
    Uses Groq API to create a realistic penetration testing narrative.
    """
    scan = get_scan(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {request.scan_id}")

    try:
        simulation = generate_attack_simulation(
            domain=scan["domain"],
            assets=scan["assets"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Attack simulation failed: {str(e)}")

    return {"attack_simulation": simulation}
