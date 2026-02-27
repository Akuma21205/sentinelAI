from typing import List, Tuple, Dict, Set


# ══════════════════════════════════════════════
#  LAYER 1 — BASE EXPOSURE SCORE
# ══════════════════════════════════════════════

SENSITIVE_PORTS: Dict[int, Tuple[int, str]] = {
    22:    (30, "SSH — remote access service"),
    3389:  (35, "RDP — remote desktop service"),
    3306:  (35, "MySQL — database service"),
    27017: (35, "MongoDB — database service"),
    5432:  (30, "PostgreSQL — database service"),
    6379:  (30, "Redis — in-memory data store"),
    21:    (25, "FTP — file transfer service"),
    25:    (15, "SMTP — mail service"),
    8080:  (10, "HTTP-Alt — alternate web service"),
    8443:  (8,  "HTTPS-Alt — alternate secure web service"),
}

WEB_PORTS: Set[int] = {80, 443}

# Threshold for "high-risk" sensitive port in compound scoring
HIGH_RISK_PORT_THRESHOLD = 25


# ══════════════════════════════════════════════
#  LAYER 2 — CONTEXTUAL RISK MODIFIERS
# ══════════════════════════════════════════════

ENV_KEYWORDS = [
    "dev", "staging", "test", "old",
    "beta", "internal", "admin",
    "backup", "uat", "demo",
]

ADMIN_KEYWORDS = ["admin", "portal", "dashboard", "manage"]


# ══════════════════════════════════════════════
#  SEVERITY THRESHOLDS
# ══════════════════════════════════════════════

def _classify_severity(score: int) -> str:
    if score >= 70:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 30:
        return "Medium"
    elif score >= 10:
        return "Low"
    else:
        return "Informational"


# ══════════════════════════════════════════════
#  SCORING ENGINE
# ══════════════════════════════════════════════

def calculate_risk(
    subdomain: str,
    open_ports: List[int],
    ip_frequency: int = 1,
) -> Tuple[int, str, List[str]]:
    """
    4-layer deterministic risk scoring engine.

    Layer 1: Base Exposure Score (ports)
    Layer 2: Contextual Risk Modifiers (keywords, density, shared infra)
    Layer 3: Interaction / Compound Risk (cross-layer combinations)
    Layer 4: Global Posture Adjustment (applied in recon_service)

    Returns (risk_score, severity, risk_factors).
    Score is clamped to [0, 100].
    """
    score = 0
    risk_factors: List[str] = []
    subdomain_lower = subdomain.lower()

    # ── LAYER 1: Base Exposure Score ──────────

    # Baseline for any open ports
    if open_ports:
        score += 2

    # Sensitive port scoring
    has_high_risk_port = False
    for port in open_ports:
        if port in SENSITIVE_PORTS:
            weight, label = SENSITIVE_PORTS[port]
            score += weight
            risk_factors.append(f"Port {port} open ({label})")
            if weight >= HIGH_RISK_PORT_THRESHOLD:
                has_high_risk_port = True

    # Standard web ports (max +6 combined)
    web_port_score = 0
    for p in open_ports:
        if p in WEB_PORTS:
            web_port_score += 3
    web_port_score = min(web_port_score, 6)
    if web_port_score > 0:
        score += web_port_score

    # ── LAYER 2: Contextual Risk Modifiers ────

    # Environment keyword detection
    env_matched = False
    env_keyword_found = None
    for kw in ENV_KEYWORDS:
        if kw in subdomain_lower:
            score += 20
            risk_factors.append(f"Sensitive lifecycle environment exposed ('{kw}' in subdomain)")
            env_matched = True
            env_keyword_found = kw
            break  # Count once

    # Admin surface detection
    admin_matched = False
    for kw in ADMIN_KEYWORDS:
        if kw in subdomain_lower:
            # Avoid double-counting if this keyword was already matched as env keyword
            if env_matched and kw == env_keyword_found:
                # Still flag admin but reduce additional score (already got +20 from env)
                score += 5
            else:
                score += 25
            risk_factors.append(f"Administrative interface potentially exposed ('{kw}' in subdomain)")
            admin_matched = True
            break  # Count once

    # Service density modifier
    port_count = len(open_ports)
    if port_count >= 4:
        score += 15
        risk_factors.append(f"Multiple services exposed on single host ({port_count} ports)")
    elif port_count >= 2:
        score += 8
        risk_factors.append(f"Multiple services exposed on single host ({port_count} ports)")

    # Shared infrastructure modifier
    if ip_frequency > 2:
        score += 8
        risk_factors.append(f"Infrastructure consolidation increases blast radius ({ip_frequency} subdomains on this IP)")

    # ── LAYER 3: Interaction / Compound Risk ──

    # Compound 1: Sensitive environment + high-risk port
    if env_matched and has_high_risk_port:
        score += 25
        risk_factors.append("High-risk service exposed within sensitive environment")

    # Compound 2: Admin surface + non-standard port exposure
    has_non_web_port = any(p not in WEB_PORTS for p in open_ports)
    if admin_matched and has_non_web_port:
        score += 20
        risk_factors.append("Administrative surface combined with service exposure")

    # ── Clamp & Classify ──────────────────────

    score = min(score, 100)
    severity = _classify_severity(score)

    if not risk_factors:
        risk_factors.append("No notable risk factors identified")

    return score, severity, risk_factors


# ══════════════════════════════════════════════
#  LAYER 4 — GLOBAL POSTURE ADJUSTMENT
# ══════════════════════════════════════════════

def apply_global_posture_adjustment(
    assets: List[Dict],
) -> List[Dict]:
    """
    Layer 4: Adjusts scores based on overall attack surface posture.
    Called AFTER individual scoring is complete.

    If total_assets > 8 and >50% have open ports → +5 to each scored asset.
    """
    total = len(assets)
    if total <= 8:
        return assets

    assets_with_ports = sum(1 for a in assets if a.get("open_ports"))
    if assets_with_ports / total <= 0.5:
        return assets

    # Apply adjustment
    for asset in assets:
        asset["risk_score"] = min(asset["risk_score"] + 5, 100)
        asset["severity"] = _classify_severity(asset["risk_score"])
        asset["risk_factors"].append("Broad public service exposure footprint")

    return assets
