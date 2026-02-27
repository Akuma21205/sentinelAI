import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.db_service import get_scan, DatabaseError
from services.ai_service import generate_summary, generate_attack_simulation
from services.attack_model_service import build_attack_graph
from services.posture_service import generate_posture_intelligence

logger = logging.getLogger("routes.ai")
router = APIRouter()


class AIRequest(BaseModel):
    scan_id: str


class SimulateRequest(BaseModel):
    scan_id: str
    deterministic_only: bool = Field(
        default=False,
        description="If true, skip AI enhancement and return only the deterministic attack graph"
    )


def _get_scan_or_404(scan_id: str):
    """Retrieve scan with structured error handling."""
    try:
        scan = get_scan(scan_id)
    except DatabaseError as e:
        logger.error("Database error retrieving scan %s: %s", scan_id, e.message)
        raise HTTPException(status_code=503, detail=e.message)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {scan_id}")
    return scan


@router.post("/summary")
def get_summary_route(request: AIRequest):
    """
    Generate an AI-powered executive summary for a completed scan.
    Uses preprocessed structured data + Groq API for accurate analysis.
    """
    scan = _get_scan_or_404(request.scan_id)

    try:
        result = generate_summary(
            domain=scan["domain"],
            assets=scan["assets"],
        )
        return result
    except Exception as e:
        logger.error("Summary generation failed: %s", str(e))
        return {
            "summary": "AI analysis temporarily unavailable. Review scan results manually.",
            "top_risks": ["AI service error — manual review recommended"],
            "recommendations": ["Retry analysis when service recovers"],
        }


@router.post("/simulate")
def simulate_attack(request: SimulateRequest):
    """
    Generate a structured attack simulation based on scan results.

    Pipeline:
    1. Build deterministic attack graph (attack_model_service)
    2. Optionally enhance with AI narratives (ai_service)
    3. Return schema-validated JSON — never raw text

    Set deterministic_only=true to bypass AI entirely.
    """
    scan = _get_scan_or_404(request.scan_id)

    # Step 1: Deterministic attack graph (always runs)
    base_graph = build_attack_graph(
        domain=scan["domain"],
        assets=scan["assets"],
    )

    logger.info(
        "Deterministic graph: %s, %d steps, risk=%s, det_only=%s",
        scan["domain"],
        len(base_graph.get("attack_path", [])),
        base_graph.get("overall_risk"),
        request.deterministic_only,
    )

    # Step 2: AI enhancement (safe — falls back to base_graph on failure)
    try:
        enhanced = generate_attack_simulation(
            domain=scan["domain"],
            assets=scan["assets"],
            base_graph=base_graph,
            deterministic_only=request.deterministic_only,
        )
        return {"attack_simulation": enhanced}
    except Exception as e:
        logger.error("Simulation error: %s — returning deterministic graph", str(e))
        return {"attack_simulation": base_graph}


@router.post("/posture")
def get_posture(request: AIRequest):
    """
    Generate a strategic security posture & intelligence report.

    Pipeline:
    1. Deterministic preprocessing of organizational patterns
    2. Weighted posture score calculation (anchor)
    3. Gemini API call with strict JSON output
    4. Schema validation + deterministic scoring enforcement
    5. Deterministic fallback on any failure
    """
    scan = _get_scan_or_404(request.scan_id)

    try:
        result = generate_posture_intelligence(
            domain=scan["domain"],
            assets=scan["assets"],
        )
        return result
    except Exception as e:
        logger.error("Posture intelligence failed: %s", str(e))
        return {
            "posture_score": 50,
            "maturity_level": "Developing",
            "dominant_risk_theme": "Assessment unavailable",
            "likely_attacker_profile": "Automated Scanners",
            "strategic_risk_outlook": "Strategic assessment temporarily unavailable.",
            "priority_improvements": ["Retry posture assessment"],
            "assessment_basis": ["Service error prevented analysis"],
            "confidence_score": 0.1,
        }
