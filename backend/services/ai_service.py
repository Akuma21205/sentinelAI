import json
import requests
from typing import Dict, Any, List
from core.config import GROQ_API_KEY

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


# ──────────────────────────────────────────────
# Data Preprocessing
# ──────────────────────────────────────────────

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

    # Sort by risk_score descending, take top 3
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
            # Use existing risk_factors from risk engine, not re-generated ones
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


# ──────────────────────────────────────────────
# Groq API Call
# ──────────────────────────────────────────────

def _call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.25) -> str:
    """Call Groq API with structured prompts."""
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

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=45)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.RequestException as e:
        raise Exception(f"Groq API request failed: {str(e)}")
    except (KeyError, IndexError):
        raise Exception("Unexpected response format from Groq API")


# ──────────────────────────────────────────────
# Response Parsers
# ──────────────────────────────────────────────

def _parse_summary_response(raw: str) -> Dict[str, Any]:
    """Parse the structured text response from the summary prompt."""
    result = {"summary": "", "top_risks": [], "recommendations": []}

    # Try JSON first (some models may still return JSON)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            # Remove code fence markers
            lines = cleaned.split("\n")
            cleaned = "\n".join(
                l for i, l in enumerate(lines)
                if not (i == 0 or i == len(lines) - 1) or not l.strip().startswith("```")
            )
        parsed = json.loads(cleaned)
        return {
            "summary": parsed.get("summary", raw),
            "top_risks": parsed.get("top_risks", []),
            "recommendations": parsed.get("recommendations", []),
        }
    except (json.JSONDecodeError, ValueError):
        pass

    # Parse structured text format
    current_section = None
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
        # Stop parsing if we hit an unexpected section header
        elif stripped.endswith(":") and stripped.isupper() and current_section:
            current_section = None
            continue

        if current_section == "summary":
            result["summary"] += (" " + stripped) if result["summary"] else stripped
        elif current_section == "risks" and (stripped.startswith("- ") or stripped.startswith("* ")):
            result["top_risks"].append(stripped[2:].strip())
        elif current_section == "recommendations":
            text = stripped
            # Remove numbering: "1. ", "2) ", etc.
            if len(stripped) >= 3 and stripped[0].isdigit():
                for sep in [". ", ") ", ": "]:
                    idx = stripped.find(sep)
                    if idx != -1 and idx <= 3:
                        text = stripped[idx + len(sep):].strip()
                        break
            if text:
                result["recommendations"].append(text)

    # Fallback if parsing failed
    if not result["summary"]:
        result["summary"] = raw

    return result


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def generate_summary(domain: str, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate an executive summary with preprocessing and structured prompting."""
    structured_data = _preprocess_scan_data(domain, assets)

    system_prompt = """You are a senior cybersecurity analyst providing an objective attack surface assessment.

STRICT RULES:
- Do NOT exaggerate risks. Be accurate and measured.
- Ports 80 and 443 alone are standard web services and are NOT high risk.
- Only treat assets with risk_score >= 30 as significant security concerns.
- If no assets have risk_score >= 30, clearly state the organization has a strong security posture with minimal attack surface exposure.
- Do NOT hallucinate or fabricate CVE numbers under any circumstances.
- Do NOT invent vulnerabilities that aren't supported by the data.
- Reference the actual risk_factors provided for each asset in your analysis.
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


def generate_attack_simulation(domain: str, assets: List[Dict[str, Any]]) -> str:
    """Generate a realistic attack simulation using only significant-risk assets."""
    structured_data = _preprocess_scan_data(domain, assets)

    # Filter to only significant-risk assets
    significant_assets = [a for a in structured_data["top_risk_assets"] if a.get("risk_score", 0) >= 30]

    system_prompt = """You are a professional penetration tester conducting a realistic attack path analysis.

STRICT RULES:
- ONLY use assets with risk_score >= 30 in your attack chain.
- If NO assets have risk_score >= 30, respond EXACTLY with:
  "No viable attack path identified based on current exposure. All discovered assets present low risk with standard web services only."
- Do NOT invent vulnerabilities or fabricate CVE numbers.
- Do NOT treat ports 80/443 alone as exploitable attack vectors.
- Base your analysis ONLY on the provided data and risk_factors.
- Be specific about which subdomains, IPs, and ports you would target.

RESPONSE FORMAT:

RECONNAISSANCE:
<what the attacker would discover and prioritize>

INITIAL_ACCESS:
<specific entry points based on exposed services>

LATERAL_MOVEMENT:
<how attacker could pivot, or state "None identified" if not applicable>

IMPACT:
<realistic potential impact based on actual exposure>

MITIGATION_NOTES:
<defensive recommendations to close identified attack paths>"""

    if not significant_assets:
        user_prompt = (
            f"Domain: {structured_data['domain']}\n"
            f"Stats: {json.dumps(structured_data['overall_stats'], indent=2)}\n\n"
            "NOTE: No assets with risk_score >= 30 were found. All assets are low risk."
        )
    else:
        user_prompt = (
            f"Domain: {structured_data['domain']}\n"
            f"Stats: {json.dumps(structured_data['overall_stats'], indent=2)}\n\n"
            f"Significant Risk Assets:\n{json.dumps(significant_assets, indent=2)}"
        )

    try:
        return _call_groq(system_prompt, user_prompt, temperature=0.3)
    except Exception:
        raise
