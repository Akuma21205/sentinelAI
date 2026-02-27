import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.db_service import get_scan
from services.ai_service import generate_summary, generate_attack_simulation
from services.attack_model_service import build_attack_graph

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
        logger.error("Summary generation failed: %s", str(e))
        return {
            "summary": f"AI analysis unavailable: {str(e)}",
            "top_risks": ["Unable to generate risk analysis — AI service error"],
            "recommendations": ["Retry analysis or review scan results manually"],
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
    scan = get_scan(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail=f"Scan not found: {request.scan_id}")

    # Step 1: Deterministic attack graph (always runs)
    base_graph = build_attack_graph(
        domain=scan["domain"],
        assets=scan["assets"],
    )

    logger.info(
        "Deterministic graph built for %s: %d steps, risk=%s, deterministic_only=%s",
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
        logger.error("Simulation pipeline error: %s — returning deterministic graph", str(e))
        return {"attack_simulation": base_graph}
