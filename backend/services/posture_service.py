"""
Posture Intelligence Service — Strategic Security Assessment via Gemini

Generates organizational-level security posture classification
from deterministic scan data. Evaluates systemic patterns, maturity,
and strategic risk outlook — NOT a duplicate of tactical summaries.

Pipeline:
  1. Deterministic preprocessing of organizational patterns
  2. Weighted severity posture score calculation
  3. Gemini API call with strict JSON constraints (≤250 words)
  4. Schema validation + deterministic scoring enforcement
  5. Safe fallback on any failure
"""

import json
import logging
import time
from collections import Counter
from typing import Dict, Any, List

from google import genai
from core.config import GEMINI_API_KEY

logger = logging.getLogger("posture_service")

GEMINI_MODEL = "gemini-2.5-flash"


# ══════════════════════════════════════════════
#  Deterministic Preprocessing
# ══════════════════════════════════════════════

ADMIN_KEYWORDS = {"admin", "portal", "dashboard", "manage", "panel", "console"}
ENV_KEYWORDS = {"dev", "staging", "test", "old", "beta", "internal", "backup", "uat", "demo"}

# Severity weights for posture score calculation
SEVERITY_WEIGHTS = {"Critical": 1.0, "High": 0.7, "Medium": 0.4, "Low": 0.15, "Informational": 0.0}


def _preprocess_posture_data(domain: str, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Build organizational pattern metrics from asset data.
    Returns structured input for Gemini — NO raw asset dumps.
    """
    total = len(assets)
    if total == 0:
        return {
            "domain": domain,
            "total_assets": 0,
            "risk_distribution": {},
            "severity_breakdown": {},
            "infrastructure_concentration": {},
            "environment_exposure": [],
            "admin_surface_exposure": [],
            "service_density": {},
            "top_risk_factors": [],
            "data_completeness": "minimal",
        }

    # Risk score distribution
    risk_scores = [a.get("risk_score", 0) for a in assets]
    risk_buckets = {
        "low_risk_count": sum(1 for s in risk_scores if s < 30),
        "medium_risk_count": sum(1 for s in risk_scores if 30 <= s < 60),
        "high_risk_count": sum(1 for s in risk_scores if 60 <= s < 80),
        "critical_risk_count": sum(1 for s in risk_scores if s >= 80),
        "average_risk_score": round(sum(risk_scores) / total, 1),
        "peak_risk_score": max(risk_scores),
    }

    # Severity breakdown
    severity_counts = Counter(a.get("severity", "Low") for a in assets)

    # Infrastructure concentration (IP reuse)
    ip_freq = Counter(a.get("ip") for a in assets if a.get("ip"))
    shared_ips = {ip: count for ip, count in ip_freq.items() if count > 1}
    concentration = {
        "unique_ips": len(ip_freq),
        "shared_ip_count": len(shared_ips),
        "max_assets_per_ip": max(ip_freq.values()) if ip_freq else 0,
    }

    # Environment keyword exposure
    env_exposed = []
    admin_exposed = []
    for a in assets:
        sub = a.get("subdomain", "").lower()
        for kw in ENV_KEYWORDS:
            if kw in sub:
                env_exposed.append({"subdomain": a.get("subdomain"), "keyword": kw})
                break
        for kw in ADMIN_KEYWORDS:
            if kw in sub:
                admin_exposed.append({"subdomain": a.get("subdomain"), "keyword": kw})
                break

    # Service density — port count per asset
    port_counts = [len(a.get("open_ports", [])) for a in assets]
    density = {
        "average_ports_per_asset": round(sum(port_counts) / total, 1) if total else 0,
        "max_ports_on_single_asset": max(port_counts) if port_counts else 0,
        "assets_with_no_ports": sum(1 for c in port_counts if c == 0),
    }

    # Top risk factors (deduplicated)
    all_factors: List[str] = []
    for a in assets:
        for f in a.get("risk_factors", []):
            if f not in all_factors and f != "No notable risk factors identified":
                all_factors.append(f)

    # Data completeness
    has_ports = sum(1 for a in assets if a.get("open_ports"))
    completeness = "comprehensive" if has_ports > total * 0.5 else "moderate" if has_ports > 0 else "minimal"

    return {
        "domain": domain,
        "total_assets": total,
        "risk_distribution": risk_buckets,
        "severity_breakdown": dict(severity_counts),
        "infrastructure_concentration": concentration,
        "environment_exposure": env_exposed[:5],
        "admin_surface_exposure": admin_exposed[:5],
        "service_density": density,
        "top_risk_factors": all_factors[:10],
        "data_completeness": completeness,
    }


# ══════════════════════════════════════════════
#  Deterministic Posture Score Calculation
# ══════════════════════════════════════════════

def _calculate_deterministic_posture_score(posture_data: Dict[str, Any]) -> int:
    """
    Calculate posture score from weighted formula:
      base = 100 - weighted_severity_score
      + infrastructure_concentration_modifier
      + service_density_modifier

    Returns integer 0-100.
    """
    total = posture_data.get("total_assets", 0)
    if total == 0:
        return 85  # No exposure = strong posture

    severity = posture_data.get("severity_breakdown", {})
    concentration = posture_data.get("infrastructure_concentration", {})
    density = posture_data.get("service_density", {})

    # ── Weighted severity score (0-100 penalty, higher = worse) ──
    weighted_sum = 0.0
    for sev, weight in SEVERITY_WEIGHTS.items():
        count = severity.get(sev, 0)
        weighted_sum += count * weight

    # Normalize: max penalty = total * 1.0 (all critical)
    severity_penalty = (weighted_sum / total) * 60  # Scale to 60-point range

    # ── Infrastructure concentration modifier ──
    shared_count = concentration.get("shared_ip_count", 0)
    max_per_ip = concentration.get("max_assets_per_ip", 1)
    concentration_penalty = min(shared_count * 2 + (max_per_ip - 1) * 1.5, 15)

    # ── Service density modifier ──
    avg_ports = density.get("average_ports_per_asset", 0)
    density_penalty = min(avg_ports * 1.5, 10) if avg_ports > 1.5 else 0

    score = 100 - severity_penalty - concentration_penalty - density_penalty
    return max(0, min(100, round(score)))


def _determine_maturity(posture_score: int, posture_data: Dict[str, Any]) -> str:
    """Determine maturity level with ceiling rules."""
    critical = posture_data.get("risk_distribution", {}).get("critical_risk_count", 0)

    # Hard ceiling: critical assets → max Developing
    if critical > 0:
        if posture_score >= 30:
            return "Developing"
        return "Basic"

    if posture_score >= 75:
        return "Advanced"
    elif posture_score >= 55:
        return "Intermediate"
    elif posture_score >= 30:
        return "Developing"
    return "Basic"


# ══════════════════════════════════════════════
#  Schema Validation
# ══════════════════════════════════════════════

VALID_MATURITY = {"Basic", "Developing", "Intermediate", "Advanced"}
VALID_ATTACKER = {"Opportunistic", "Targeted", "Advanced Persistent", "Automated Scanners"}


def _validate_posture_schema(data: Dict[str, Any]) -> bool:
    """Validate Gemini output conforms to strict posture schema."""
    if not isinstance(data, dict):
        return False

    required = {
        "posture_score", "maturity_level",
        "dominant_risk_theme", "likely_attacker_profile",
        "strategic_risk_outlook",
        "priority_improvements", "assessment_basis", "confidence_score",
    }
    if not required.issubset(data.keys()):
        logger.warning("Posture schema missing keys: %s", required - data.keys())
        return False

    if not isinstance(data["posture_score"], (int, float)) or not (0 <= data["posture_score"] <= 100):
        return False
    if data["maturity_level"] not in VALID_MATURITY:
        return False
    if data["likely_attacker_profile"] not in VALID_ATTACKER:
        return False
    if not isinstance(data["priority_improvements"], list) or len(data["priority_improvements"]) < 1:
        return False
    if not isinstance(data["assessment_basis"], list) or len(data["assessment_basis"]) < 1:
        return False
    if not isinstance(data["confidence_score"], (int, float)) or not (0 <= data["confidence_score"] <= 1):
        return False

    return True


# ══════════════════════════════════════════════
#  Deterministic Scoring Enforcement
# ══════════════════════════════════════════════

def _enforce_scoring_rules(
    result: Dict[str, Any],
    posture_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Override Gemini output if it violates deterministic constraints.

    Rules:
      1. critical > 0 → posture_score ≤ 45, maturity ≤ Developing
      2. (high + critical) / total > 0.4 → posture_score ≤ 55
      3. No assets risk_score ≥ 30 → posture_score ≥ 75, maturity = Advanced
      4. posture_score must be within ±10 of deterministic calculation
    """
    total = posture_data.get("total_assets", 0)
    risk = posture_data.get("risk_distribution", {})
    completeness = posture_data.get("data_completeness", "minimal")

    critical = risk.get("critical_risk_count", 0)
    high = risk.get("high_risk_count", 0)
    low_risk = risk.get("low_risk_count", 0)
    significant = total - low_risk  # assets with risk >= 30 (approx)

    # Calculate deterministic anchor
    det_score = _calculate_deterministic_posture_score(posture_data)
    score = result.get("posture_score", det_score)

    # Clamp within ±10 of deterministic anchor
    score = max(det_score - 10, min(det_score + 10, score))

    # Rule 1: Critical assets → hard ceiling
    if critical > 0:
        score = min(score, 45)
        if result.get("maturity_level") in {"Intermediate", "Advanced"}:
            result["maturity_level"] = "Developing"

    # Rule 2: High severity concentration → ceiling
    if total > 0 and (high + critical) / total > 0.4:
        score = min(score, 55)

    # Rule 3: No significant risk → floor
    no_significant = all(a.get("risk_score", 0) < 30 for a in [])  # Can't re-read assets here
    if total > 0 and low_risk == total:
        score = max(score, 75)
        result["maturity_level"] = "Advanced"

    result["posture_score"] = max(0, min(100, round(score)))

    # Enforce maturity ceiling
    result["maturity_level"] = _determine_maturity(result["posture_score"], posture_data)

    # Confidence enforcement
    if completeness == "comprehensive" and total >= 5:
        result["confidence_score"] = max(result.get("confidence_score", 0.5), 0.75)
    elif completeness == "minimal" or total < 3:
        result["confidence_score"] = min(result.get("confidence_score", 0.5), 0.55)

    result["confidence_score"] = round(result["confidence_score"], 2)

    return result


# ══════════════════════════════════════════════
#  Gemini API Call (with retry + backoff)
# ══════════════════════════════════════════════

MAX_RETRIES = 2
BACKOFF_BASE = 1.5  # seconds


def _call_gemini(prompt: str) -> str:
    """Call Gemini API with retry and exponential backoff."""
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=GEMINI_API_KEY)

    for attempt in range(MAX_RETRIES + 1):
        try:
            logger.info("Gemini API call attempt %d/%d (model=%s)", attempt + 1, MAX_RETRIES + 1, GEMINI_MODEL)
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            content = response.text
            logger.info("Gemini returned %d characters", len(content))
            return content
        except Exception as e:
            logger.warning("Gemini attempt %d failed: %s", attempt + 1, str(e))
            if attempt < MAX_RETRIES:
                wait = BACKOFF_BASE * (2 ** attempt)
                logger.info("Retrying in %.1fs...", wait)
                time.sleep(wait)
            else:
                raise Exception(f"Gemini API failed after {MAX_RETRIES + 1} attempts: {str(e)}")


def _strip_code_fence(text: str) -> str:
    """Remove markdown code fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip()


# ══════════════════════════════════════════════
#  Deterministic Fallback
# ══════════════════════════════════════════════

def _build_deterministic_fallback(
    domain: str,
    posture_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Generate a fully deterministic posture report when AI is unavailable."""
    risk = posture_data.get("risk_distribution", {})
    total = posture_data.get("total_assets", 0)
    avg = risk.get("average_risk_score", 0)
    critical = risk.get("critical_risk_count", 0)
    high = risk.get("high_risk_count", 0)

    score = _calculate_deterministic_posture_score(posture_data)
    maturity = _determine_maturity(score, posture_data)

    # Attacker profile
    if critical > 0:
        attacker = "Targeted"
    elif high >= 2:
        attacker = "Opportunistic"
    else:
        attacker = "Automated Scanners"

    env_count = len(posture_data.get("environment_exposure", []))
    admin_count = len(posture_data.get("admin_surface_exposure", []))

    # Dominant risk theme
    if admin_count > 0 and high + critical > 0:
        theme = "Administrative surface compounded by exposed services"
    elif admin_count > 0:
        theme = "Administrative interface exposure"
    elif env_count > 0:
        theme = "Non-production environment exposure"
    elif high + critical > 0:
        theme = "Elevated service exposure"
    else:
        theme = "Standard web service footprint"

    improvements = []
    if admin_count > 0:
        improvements.append("Restrict administrative interfaces from public access")
    if env_count > 0:
        improvements.append("Isolate non-production environments behind VPN or allowlists")
    if high + critical > 0:
        improvements.append("Remediate high-severity assets through port restriction and access controls")
    if not improvements:
        improvements.append("Maintain current posture with periodic reassessment")

    completeness = posture_data.get("data_completeness", "minimal")

    return {
        "posture_score": score,
        "maturity_level": maturity,
        "dominant_risk_theme": theme,
        "likely_attacker_profile": attacker,
        "strategic_risk_outlook": (
            f"{domain} presents {'elevated' if score < 50 else 'moderate' if score < 75 else 'low'} "
            f"organizational risk across {total} discovered assets."
        ),
        "priority_improvements": improvements[:3],
        "assessment_basis": [
            f"{total} assets analyzed, avg risk {avg}",
            f"Severity: {dict(posture_data.get('severity_breakdown', {}))}",
            f"Data completeness: {completeness}",
        ],
        "confidence_score": round(0.75 if total >= 5 and completeness == "comprehensive" else 0.55 if total >= 3 else 0.4, 2),
    }


# ══════════════════════════════════════════════
#  Public API
# ══════════════════════════════════════════════

def generate_posture_intelligence(
    domain: str,
    assets: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generate strategic security posture intelligence.

    Pipeline:
      1. Deterministic preprocessing
      2. Weighted posture score calculation (anchor)
      3. Gemini enhancement (constrained to ≤250 words)
      4. Schema validation + deterministic enforcement
      5. Fallback on any failure
    """
    posture_data = _preprocess_posture_data(domain, assets)
    det_score = _calculate_deterministic_posture_score(posture_data)

    logger.info(
        "Posture request for %s: %d assets, det_score=%d, completeness=%s",
        domain, posture_data["total_assets"], det_score, posture_data["data_completeness"],
    )

    if posture_data["total_assets"] == 0:
        return _build_deterministic_fallback(domain, posture_data)

    prompt = f"""You are a strategic cybersecurity intelligence analyst.

TASK: Organizational security posture assessment for {domain}.

Evaluate ORGANIZATIONAL PATTERNS — not individual exploits.
Tactical findings are covered separately. Do not restate them.

RULES:
- Output ONLY valid JSON — no markdown, no code fences
- Total output must be under 250 words
- Do NOT reference external benchmarks or industry statistics
- Do NOT fabricate vulnerabilities or CVEs
- Do NOT contradict the deterministic scores
- Be concise, analytical, board-ready
- Avoid clichés

The deterministic posture score anchor is {det_score}/100.
Your posture_score must be within ±10 of this anchor.

OUTPUT FORMAT (pure JSON):
{{
  "posture_score": <int 0-100, within ±10 of {det_score}>,
  "maturity_level": "<Basic|Developing|Intermediate|Advanced>",
  "dominant_risk_theme": "<primary systemic weakness>",
  "likely_attacker_profile": "<Opportunistic|Targeted|Advanced Persistent|Automated Scanners>",
  "strategic_risk_outlook": "<1-2 sentence forward-looking assessment>",
  "priority_improvements": ["Action 1", "Action 2", "Action 3"],
  "assessment_basis": ["Factor 1", "Factor 2", "Factor 3"],
  "confidence_score": <float 0.0-1.0>
}}

DATA:
{json.dumps(posture_data, indent=2)}"""

    try:
        raw = _call_gemini(prompt)
        cleaned = _strip_code_fence(raw)
        parsed = json.loads(cleaned)

        if not _validate_posture_schema(parsed):
            logger.warning("Gemini output failed schema validation — using fallback")
            return _build_deterministic_fallback(domain, posture_data)

        result = _enforce_scoring_rules(parsed, posture_data)
        logger.info("Posture generated: score=%d, maturity=%s (det_anchor=%d)",
                     result["posture_score"], result["maturity_level"], det_score)
        return result

    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Gemini parse failed (%s) — using fallback", str(e))
        return _build_deterministic_fallback(domain, posture_data)
    except Exception as e:
        logger.error("Posture intelligence failed (%s) — using fallback", str(e))
        return _build_deterministic_fallback(domain, posture_data)
