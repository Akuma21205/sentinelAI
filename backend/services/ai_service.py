import json
import requests
from typing import Dict, Any, List
from core.config import GROQ_API_KEY

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


def _call_groq(system_prompt: str, user_prompt: str) -> str:
    """
    Call the Groq API with a system + user prompt.
    Returns the assistant's response text.
    """
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
        "temperature": 0.3,
        "max_tokens": 2048,
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.RequestException as e:
        raise Exception(f"Groq API request failed: {str(e)}")
    except (KeyError, IndexError):
        raise Exception("Unexpected response format from Groq API")


def generate_summary(domain: str, assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate an executive summary with top risks and recommendations.
    """
    system_prompt = (
        "You are a senior cybersecurity analyst. Analyze the attack surface scan results "
        "and provide a structured security assessment. "
        "Do NOT hallucinate or fabricate CVE numbers. Only reference real, well-known vulnerabilities if applicable. "
        "Respond ONLY with valid JSON in the following format:\n"
        '{"summary": "Executive overview text", '
        '"top_risks": ["risk1", "risk2", "risk3"], '
        '"recommendations": ["rec1", "rec2", "rec3"]}'
    )

    user_prompt = (
        f"Domain: {domain}\n"
        f"Total assets discovered: {len(assets)}\n\n"
        f"Assets:\n{json.dumps(assets, indent=2)}\n\n"
        "Provide an executive summary, top 3 risks, and top 3 actionable recommendations."
    )

    raw_response = _call_groq(system_prompt, user_prompt)

    # Try to parse JSON from the response
    try:
        # Handle cases where LLM wraps JSON in markdown code blocks
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first and last lines (```json and ```)
            cleaned = "\n".join(lines[1:-1])
        result = json.loads(cleaned)
        return {
            "summary": result.get("summary", "No summary generated."),
            "top_risks": result.get("top_risks", []),
            "recommendations": result.get("recommendations", []),
        }
    except json.JSONDecodeError:
        # Fallback: return raw text as summary
        return {
            "summary": raw_response,
            "top_risks": [],
            "recommendations": [],
        }


def generate_attack_simulation(domain: str, assets: List[Dict[str, Any]]) -> str:
    """
    Generate a realistic attack chain simulation based on scan results.
    """
    system_prompt = (
        "You are a red team penetration testing expert. Based on the attack surface scan results, "
        "simulate a realistic step-by-step attack chain that an adversary might follow. "
        "Do NOT hallucinate or fabricate CVE numbers. "
        "Be specific about which discovered assets and ports would be targeted. "
        "Format the response as a clear, numbered step-by-step attack narrative."
    )

    user_prompt = (
        f"Domain: {domain}\n"
        f"Total assets discovered: {len(assets)}\n\n"
        f"Assets:\n{json.dumps(assets, indent=2)}\n\n"
        "Create a realistic attack simulation showing how an attacker would exploit these findings."
    )

    return _call_groq(system_prompt, user_prompt)
