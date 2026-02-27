from typing import List, Tuple


def calculate_risk(subdomain: str, open_ports: List[int]) -> Tuple[int, str]:
    """
    Deterministic risk scoring based on subdomain name and open ports.

    Scoring rules:
    - dev/staging/test/old in subdomain → +15
    - Ports 22 or 3389 (SSH/RDP)      → +25
    - Ports 3306 or 27017 (DB)        → +30
    - Ports 80 or 443 (HTTP/S)        → +5

    Severity thresholds:
    - >= 50 → Critical
    - >= 30 → High
    - >= 15 → Medium
    - else  → Low
    """
    score = 0
    subdomain_lower = subdomain.lower()

    # Subdomain keyword scoring
    risky_keywords = ["dev", "staging", "test", "old"]
    for keyword in risky_keywords:
        if keyword in subdomain_lower:
            score += 15
            break  # Only count once

    # Port-based scoring
    for port in open_ports:
        if port in (22, 3389):
            score += 25
        elif port in (3306, 27017):
            score += 30
        elif port in (80, 443):
            score += 5

    # Determine severity
    if score >= 50:
        severity = "Critical"
    elif score >= 30:
        severity = "High"
    elif score >= 15:
        severity = "Medium"
    else:
        severity = "Low"

    return score, severity
