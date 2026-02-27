"""
AI Service — Groq LLM Integration (Hardened)

Features:
  - Executive summary generation from preprocessed scan data
  - AI-enhanced attack simulation narratives from deterministic graphs
  - JSON schema validation before response return
  - Deterministic mode flag (AI bypass)
  - Timeout protection on all API calls
  - Structured logging throughout
  - Safe fallback for malformed AI output
"""

import json
import logging
import requests
from typing import Dict, Any, List, Optional
from core.config import GROQ_API_KEY

logger = logging.getLogger("ai_service")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_TIMEOUT_SECONDS = 45


# ══════════════════════════════════════════════
#  JSON Schema Validation
# ══════════════════════════════════════════════

def _validate_attack_simulation_schema(data: Dict[str, Any]) -> bool:
    """
    Validate that the attack simulation output conforms to strict schema.
    Returns True if valid, False if not.
    """
    if not isinstance(data, dict):
        return False

    # Required top-level keys
    required = {"entry_point", "attack_path", "impact_summary", "overall_risk"}
    if not required.issubset(data.keys()):
        logger.warning("Schema validation failed: missing keys %s", required - data.keys())
        return False

    # attack_path must be a list
    if not isinstance(data["attack_path"], list):
        logger.warning("Schema validation failed: attack_path is not a list")
        return False

    # overall_risk must be one of the valid values
    valid_risks = {"Low", "Medium", "High", "Critical"}
    if data["overall_risk"] not in valid_risks:
        logger.warning("Schema validation failed: invalid overall_risk '%s'", data["overall_risk"])
        return False

    # impact_summary must be a non-empty string
    if not isinstance(data["impact_summary"], str) or not data["impact_summary"].strip():
        logger.warning("Schema validation failed: impact_summary empty or not a string")
        return False

    # Validate each step in attack_path
    step_required = {"step", "stage", "subdomain", "ip", "technique", "mitre_id", "evidence", "confidence_score"}
    for i, step in enumerate(data["attack_path"]):
        if not isinstance(step, dict):
            logger.warning("Schema validation failed: step %d is not a dict", i)
            return False
        if not step_required.issubset(step.keys()):
            logger.warning("Schema validation failed: step %d missing keys %s", i, step_required - step.keys())
            return False
        if not isinstance(step["evidence"], list):
            logger.warning("Schema validation failed: step %d evidence is not a list", i)
            return False
        if not isinstance(step["confidence_score"], (int, float)):
            logger.warning("Schema validation failed: step %d confidence_score is not numeric", i)
            return False
        if not (0 <= step["confidence_score"] <= 1.0):
            logger.warning("Schema validation failed: step %d confidence_score out of range", i)
            return False

    return True


def _validate_summary_schema(data: Dict[str, Any]) -> bool:
    """Validate the executive summary output schema."""
    if not isinstance(data, dict):
        return False
    if not isinstance(data.get("summary"), str) or not data["summary"].strip():
        return False
    if not isinstance(data.get("top_risks"), list):
        return False
    if not isinstance(data.get("recommendations"), list):
        return False
    return True


# ══════════════════════════════════════════════
#  Data Preprocessing
# ══════════════════════════════════════════════

def _preprocess_scan_data(domain: str, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Build a structured summary from raw scan data.
    Uses risk_factors already computed by the risk engine.
    Only sends relevant, summarized information to the LLM.
    """
    severity_counts = {
        "critical": 0, "high": 0, "medium": 0, "low": 0, "informational": 0
    }
    for a in assets:
        sev = a.get("severity", "").lower()
        if sev in severity_counts:
            severity_counts[sev] += 1

    sorted_assets = sorted(assets, key=lambda a: a.get("risk_score", 0), reverse=True)
    significant = [a for a in assets if a.get("risk_score", 0) >= 30]
    top_assets = sorted_assets[:3]

    top_risk_assets = []
    for asset in top_assets:
        top_risk_assets.append({
            "subdomain": asset.get("subdomain"),
            "ip": asset.get("ip"),
            "risk_score": asset.get("risk_score", 0),
            "severity": asset.get("severity", "Low"),
            "open_ports": asset.get("open_ports", []),
            "risk_factors": asset.get("risk_factors", []),
        })

    return {
        "domain": domain,
        "overall_stats": {
            "total_assets": len(assets),
            **severity_counts,
            "significant_risk_count": len(significant),
        },
        "top_risk_assets": top_risk_assets,
    }


# ══════════════════════════════════════════════
#  Groq API Call (with timeout protection)
# ══════════════════════════════════════════════

def _call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.25) -> str:
    """Call Groq API with structured prompts and timeout protection."""
    if not GROQ_API_KEY:
        raise Exception("GROQ_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": 2048,
    }

    logger.info("Calling Groq API (model=%s, temp=%.2f)", GROQ_MODEL, temperature)

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=GROQ_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        logger.info("Groq API returned %d characters", len(content))
        return content
    except requests.Timeout:
        logger.error("Groq API timed out after %ds", GROQ_TIMEOUT_SECONDS)
        raise Exception(f"Groq API timed out after {GROQ_TIMEOUT_SECONDS}s")
    except requests.RequestException as e:
        logger.error("Groq API request failed: %s", str(e))
        raise Exception(f"Groq API request failed: {str(e)}")
    except (KeyError, IndexError):
        logger.error("Unexpected response format from Groq API")
        raise Exception("Unexpected response format from Groq API")


# ══════════════════════════════════════════════
#  Response Parsers
# ══════════════════════════════════════════════

def _strip_code_fence(text: str) -> str:
    """Remove markdown code fence wrappers if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last lines if they are fences
        if lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip()


def _parse_summary_response(raw: str) -> Dict[str, Any]:
    """Parse the structured text response from the summary prompt."""
    result: Dict[str, Any] = {"summary": "", "top_risks": [], "recommendations": []}

    # Try JSON first
    try:
        parsed = json.loads(_strip_code_fence(raw))
        result = {
            "summary": parsed.get("summary", raw),
            "top_risks": parsed.get("top_risks", []),
            "recommendations": parsed.get("recommendations", []),
        }
        if _validate_summary_schema(result):
            return result
    except (json.JSONDecodeError, ValueError):
        pass

    # Parse structured text format
    current_section: Optional[str] = None
    for line in raw.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue

        upper = stripped.upper()
        if upper.startswith("EXECUTIVE_SUMMARY:") or upper.startswith("EXECUTIVE SUMMARY:"):
            current_section = "summary"
            content = stripped.split(":", 1)[1].strip() if ":" in stripped else ""
            if content:
                result["summary"] = content
            continue
        elif upper.startswith("TOP_RISKS:") or upper.startswith("TOP RISKS:"):
            current_section = "risks"
            continue
        elif upper.startswith("RECOMMENDATIONS:"):
            current_section = "recommendations"
            continue
        elif stripped.endswith(":") and stripped.isupper() and current_section:
            current_section = None
            continue

        if current_section == "summary":
            result["summary"] += (" " + stripped) if result["summary"] else stripped
        elif current_section == "risks" and (stripped.startswith("- ") or stripped.startswith("* ")):
            result["top_risks"].append(stripped[2:].strip())
        elif current_section == "recommendations":
            text = stripped
            if len(stripped) >= 3 and stripped[0].isdigit():
                for sep in [". ", ") ", ": "]:
                    idx = stripped.find(sep)
                    if idx != -1 and idx <= 3:
                        text = stripped[idx + len(sep):].strip()
                        break
            if text:
                result["recommendations"].append(text)

    if not result["summary"]:
        result["summary"] = raw

    if _validate_summary_schema(result):
        logger.info("Summary parsed successfully")
    else:
        logger.warning("Summary schema validation failed — returning best-effort")

    return result


def _parse_simulation_enhancement(
    raw: str,
    base_graph: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Parse AI enhancement and merge into deterministic graph.
    AI may update: impact_summary, mitigation_notes, per-step impact descriptions.
    AI must NOT: change structure, add assets, override confidence scores.
    Falls back to base graph if parsing fails.
    """
    result = json.loads(json.dumps(base_graph))  # deep copy

    try:
        parsed = json.loads(_strip_code_fence(raw))

        # Apply AI-enhanced impact summary
        if "impact_summary" in parsed and isinstance(parsed["impact_summary"], str):
            result["impact_summary"] = parsed["impact_summary"]

        # Apply AI-generated mitigation notes
        if "mitigation_notes" in parsed and isinstance(parsed["mitigation_notes"], list):
            result["mitigation_notes"] = [
                n for n in parsed["mitigation_notes"]
                if isinstance(n, str) and n.strip()
            ]

        # Merge AI impact descriptions into existing steps
        # NEVER override: step, stage, subdomain, ip, technique, mitre_id, evidence, confidence_score
        if "attack_path" in parsed and isinstance(parsed["attack_path"], list):
            for ai_step in parsed["attack_path"]:
                if not isinstance(ai_step, dict) or "step" not in ai_step:
                    continue
                step_num = ai_step["step"]
                # Find matching step in base graph
                for base_step in result["attack_path"]:
                    if base_step["step"] == step_num:
                        # Only allow AI to add a narrative "impact_detail" field
                        if "impact_detail" in ai_step and isinstance(ai_step["impact_detail"], str):
                            base_step["impact_detail"] = ai_step["impact_detail"]
                        break

        # Validate overall_risk if AI changed it
        if "overall_risk" in parsed and parsed["overall_risk"] in {"Low", "Medium", "High", "Critical"}:
            result["overall_risk"] = parsed["overall_risk"]

        logger.info("AI enhancement merged successfully")
        return result

    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logger.warning("AI enhancement parse failed (%s) — using deterministic graph", str(e))
        return result


# ══════════════════════════════════════════════
#  Public API
# ══════════════════════════════════════════════

def generate_summary(domain: str, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate an executive summary with preprocessing and structured prompting."""
    structured_data = _preprocess_scan_data(domain, assets)

    system_prompt = """You are a senior cybersecurity analyst providing an objective attack surface assessment.

STRICT RULES:
- Do NOT exaggerate risks. Be accurate and measured.
- Ports 80 and 443 alone are standard web services and are NOT high risk.
- Only treat assets with risk_score >= 30 as significant security concerns.
- If no assets have risk_score >= 30, clearly state the organization has a strong security posture.
- Do NOT hallucinate or fabricate CVE numbers under any circumstances.
- Do NOT invent vulnerabilities not supported by the data.
- Reference the actual risk_factors provided for each asset.
- Keep the executive summary under 200 words.
- Provide specific, prioritized, actionable recommendations.

RESPONSE FORMAT (use this exact structure):

EXECUTIVE_SUMMARY:
<concise analytical overview>

TOP_RISKS:
- <risk 1 based on actual findings>
- <risk 2 based on actual findings>
- <risk 3 based on actual findings>

RECOMMENDATIONS:
1. <highest priority action>
2. <second priority action>
3. <third priority action>"""

    user_prompt = f"Analyze the following structured attack surface data:\n\n{json.dumps(structured_data, indent=2)}"

    try:
        raw_response = _call_groq(system_prompt, user_prompt, temperature=0.25)
        return _parse_summary_response(raw_response)
    except Exception:
        raise


def generate_attack_simulation(
    domain: str,
    assets: List[Dict[str, Any]],
    base_graph: Dict[str, Any],
    deterministic_only: bool = False,
) -> Dict[str, Any]:
    """
    Enhance a deterministic attack graph with AI-generated narratives.

    Args:
        domain: Target domain
        assets: Full asset list from scan
        base_graph: Pre-built deterministic attack graph from attack_model_service
        deterministic_only: If True, skip AI and return base_graph as-is

    Returns:
        Validated attack simulation JSON conforming to strict schema.
    """
    logger.info(
        "Simulation request for %s: deterministic_only=%s, steps=%d",
        domain, deterministic_only, len(base_graph.get("attack_path", [])),
    )

    # Log the deterministic graph BEFORE any AI call
    logger.info("Deterministic graph: %s", json.dumps(base_graph, default=str))

    # Deterministic mode — skip AI entirely
    if deterministic_only:
        logger.info("Deterministic-only mode — skipping AI enhancement")
        if _validate_attack_simulation_schema(base_graph):
            return base_graph
        logger.warning("Deterministic graph failed schema validation — returning anyway")
        return base_graph

    # If no attack path, no need for AI enhancement
    if not base_graph.get("attack_path"):
        logger.info("No attack path — returning safe response")
        return base_graph

    system_prompt = """You are a senior penetration tester enhancing a structured attack simulation report.

You will receive a pre-built, evidence-based attack graph with MITRE ATT&CK mappings.
Your job is STRICTLY LIMITED to:
  1. Adding an "impact_detail" narrative to each step (1-2 sentences of technical context)
  2. Enhancing the "impact_summary" with a realistic executive-level assessment
  3. Adding "mitigation_notes" — a list of specific defensive recommendations

STRICT RULES:
- Do NOT change: step numbers, stages, subdomains, IPs, techniques, mitre_ids, evidence, confidence_scores
- Do NOT fabricate CVE numbers or vulnerabilities not in the evidence
- Do NOT add new attack steps or assets
- Do NOT override the overall_risk assessment
- Return valid JSON only — no markdown, no code fences

RESPONSE FORMAT (pure JSON):
{
  "attack_path": [
    {
      "step": 1,
      "impact_detail": "<1-2 sentence technical narrative>"
    }
  ],
  "impact_summary": "<enhanced executive impact summary>",
  "mitigation_notes": [
    "<specific defensive recommendation 1>",
    "<specific defensive recommendation 2>"
  ],
  "overall_risk": "Low | Medium | High | Critical"
}"""

    user_prompt = (
        f"Domain: {domain}\n\n"
        f"Attack Graph to enhance:\n{json.dumps(base_graph, indent=2)}"
    )

    try:
        raw_response = _call_groq(system_prompt, user_prompt, temperature=0.3)
        enhanced = _parse_simulation_enhancement(raw_response, base_graph)

        # Final schema validation
        if _validate_attack_simulation_schema(enhanced):
            logger.info("Enhanced simulation passed schema validation")
            return enhanced
        else:
            logger.warning("Enhanced simulation failed validation — returning deterministic graph")
            return base_graph

    except Exception as e:
        logger.error("AI enhancement failed (%s) — returning deterministic graph", str(e))
        return base_graph
