"""
Attack Model Service — Deterministic Attack Chain Builder (Hardened)

Builds structured attack graphs from scan data BEFORE AI enhancement.
5-stage classification pipeline with:
  INITIAL_ACCESS → PRIVILEGE_ESCALATION → LATERAL_MOVEMENT → DATA_EXFILTRATION

All logic is deterministic and evidence-based.
Uses MITRE ATT&CK technique mapping throughout.
"""

import logging
from collections import Counter
from typing import Dict, Any, List, Optional

logger = logging.getLogger("attack_model")


# ══════════════════════════════════════════════
#  MITRE ATT&CK Technique Mappings
# ══════════════════════════════════════════════

MITRE_TECHNIQUES: Dict[str, Dict[str, str]] = {
    # Initial Access
    "initial_access_web": {
        "technique": "Exploit Public-Facing Application",
        "mitre_id": "T1190",
    },
    "initial_access_remote": {
        "technique": "External Remote Services",
        "mitre_id": "T1133",
    },
    "initial_access_admin": {
        "technique": "Valid Accounts — Admin Panel Exposure",
        "mitre_id": "T1078",
    },
    # Privilege Escalation
    "privesc_db_mysql": {
        "technique": "Exploitation of Database Service (MySQL)",
        "mitre_id": "T1068",
    },
    "privesc_db_mongo": {
        "technique": "Exploitation of Database Service (MongoDB)",
        "mitre_id": "T1068",
    },
    "privesc_db_postgres": {
        "technique": "Exploitation of Database Service (PostgreSQL)",
        "mitre_id": "T1068",
    },
    "privesc_redis": {
        "technique": "Exploitation of In-Memory Data Store (Redis)",
        "mitre_id": "T1068",
    },
    "privesc_ssh": {
        "technique": "Brute Force — SSH Credential Access",
        "mitre_id": "T1110.001",
    },
    "privesc_rdp": {
        "technique": "Remote Desktop Protocol Exploitation",
        "mitre_id": "T1021.001",
    },
    "privesc_ftp": {
        "technique": "Exploitation via FTP Service",
        "mitre_id": "T1071.002",
    },
    # Lateral Movement
    "lateral_shared_infra": {
        "technique": "Lateral Movement via Shared Infrastructure",
        "mitre_id": "T1021",
    },
    "lateral_admin": {
        "technique": "Internal Administrative Interface Discovery",
        "mitre_id": "T1087.002",
    },
    "lateral_env": {
        "technique": "Exploitation of Non-Production Environment",
        "mitre_id": "T1199",
    },
    # Data Exfiltration
    "exfil_db": {
        "technique": "Data from Information Repositories",
        "mitre_id": "T1213",
    },
    "exfil_admin_db": {
        "technique": "Exfiltration via Administrative Channel",
        "mitre_id": "T1041",
    },
}


# ══════════════════════════════════════════════
#  Port & Keyword Classification
# ══════════════════════════════════════════════

PUBLIC_WEB_PORTS = {80, 443}
DATABASE_PORTS = {3306, 5432, 27017, 6379}
REMOTE_ACCESS_PORTS = {22, 3389, 21}

SENSITIVE_PORT_MAP: Dict[int, str] = {
    22:    "privesc_ssh",
    3389:  "privesc_rdp",
    3306:  "privesc_db_mysql",
    27017: "privesc_db_mongo",
    5432:  "privesc_db_postgres",
    6379:  "privesc_redis",
    21:    "privesc_ftp",
}

ADMIN_KEYWORDS = {"admin", "portal", "dashboard", "manage", "panel", "console"}
ENV_KEYWORDS = {"dev", "staging", "test", "old", "beta", "internal", "backup", "uat", "demo"}


# ══════════════════════════════════════════════
#  Classification Helpers
# ══════════════════════════════════════════════

def _is_public_exposed(asset: Dict[str, Any]) -> bool:
    """Check if asset has public-facing web ports."""
    return bool(set(asset.get("open_ports", [])) & PUBLIC_WEB_PORTS)


def _has_database_ports(asset: Dict[str, Any]) -> List[int]:
    """Return list of database ports found on this asset."""
    return [p for p in asset.get("open_ports", []) if p in DATABASE_PORTS]


def _has_sensitive_ports(asset: Dict[str, Any]) -> List[str]:
    """Return list of technique keys for sensitive ports found."""
    return [SENSITIVE_PORT_MAP[p] for p in asset.get("open_ports", []) if p in SENSITIVE_PORT_MAP]


def _has_non_web_ports(asset: Dict[str, Any]) -> bool:
    """Check if asset has any non-web ports open."""
    return any(p not in PUBLIC_WEB_PORTS for p in asset.get("open_ports", []))


def _is_admin_surface(subdomain: str) -> bool:
    lower = subdomain.lower()
    return any(kw in lower for kw in ADMIN_KEYWORDS)


def _is_env_surface(subdomain: str) -> bool:
    lower = subdomain.lower()
    return any(kw in lower for kw in ENV_KEYWORDS)


def _has_high_service_density(asset: Dict[str, Any]) -> bool:
    """True if >= 4 open ports (high service density)."""
    return len(asset.get("open_ports", [])) >= 4


# ══════════════════════════════════════════════
#  Confidence Scoring (Spec-compliant)
# ══════════════════════════════════════════════

def _compute_confidence(asset: Dict[str, Any]) -> float:
    """
    Confidence = base + compound_boost, clamped to 0.95 max.

    - Base = risk_score / 100
    - +0.05 per compound risk factor (factors containing 'compound'
      or factors from Layer 3 of the risk engine)
    """
    risk_score = asset.get("risk_score", 0)
    risk_factors = asset.get("risk_factors", [])

    base = risk_score / 100.0

    # Compound factors are Layer 3 interactions from risk_service
    compound_keywords = [
        "high-risk service exposed within",
        "administrative surface combined",
        "broad public service exposure",
    ]
    compound_count = sum(
        1 for f in risk_factors
        if any(kw in f.lower() for kw in compound_keywords)
    )
    compound_boost = compound_count * 0.05

    return round(min(base + compound_boost, 0.95), 2)


# ══════════════════════════════════════════════
#  Overall Risk Classification
# ══════════════════════════════════════════════

def _classify_overall_risk(attack_path: List[Dict]) -> str:
    """Determine overall risk based on attack path depth and confidence."""
    if not attack_path:
        return "Low"

    max_confidence = max(s.get("confidence_score", 0) for s in attack_path)
    step_count = len(attack_path)

    if max_confidence >= 0.85 or step_count >= 5:
        return "Critical"
    elif max_confidence >= 0.7 or step_count >= 3:
        return "High"
    elif max_confidence >= 0.5 or step_count >= 2:
        return "Medium"
    return "Low"


# ══════════════════════════════════════════════
#  Build Step Helper
# ══════════════════════════════════════════════

def _make_step(
    step_num: int,
    stage: str,
    technique_key: str,
    asset: Dict[str, Any],
    extra_evidence: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Build a single attack path step with full evidence chain."""
    tech = MITRE_TECHNIQUES[technique_key]
    evidence = list(asset.get("risk_factors", []))
    if extra_evidence:
        evidence.extend(extra_evidence)

    return {
        "step": step_num,
        "stage": stage,
        "subdomain": asset.get("subdomain", "unknown"),
        "ip": asset.get("ip", "unknown"),
        "technique": tech["technique"],
        "mitre_id": tech["mitre_id"],
        "evidence": evidence,
        "confidence_score": _compute_confidence(asset),
    }


# ══════════════════════════════════════════════
#  Public API
# ══════════════════════════════════════════════

def build_attack_graph(
    domain: str,
    assets: List[Dict[str, Any]],
    risk_threshold: int = 30,
) -> Dict[str, Any]:
    """
    Build a deterministic, evidence-based attack graph.

    Pipeline:
      1. Filter assets (risk_score >= threshold) and sort desc
      2. Build IP frequency map for shared infrastructure detection
      3. Classify into 4 stages: Initial Access → Privilege Escalation
         → Lateral Movement → Data Exfiltration
      4. Attach MITRE ATT&CK IDs + evidence + confidence scores
      5. Return strict JSON structure

    This is fully deterministic — NO AI involvement.
    """
    # ── Filter & sort ──
    candidates = [a for a in assets if a.get("risk_score", 0) >= risk_threshold]
    candidates.sort(key=lambda a: a.get("risk_score", 0), reverse=True)

    if not candidates:
        logger.info("No significant-risk assets for %s — returning safe response", domain)
        return {
            "entry_point": None,
            "attack_path": [],
            "impact_summary": "No viable attack path identified based on current exposure.",
            "overall_risk": "Low",
        }

    # ── IP frequency map (across ALL assets, not just candidates) ──
    ip_freq: Counter = Counter(a.get("ip") for a in assets if a.get("ip"))

    attack_path: List[Dict[str, Any]] = []
    step_num = 0
    entry_point: Optional[str] = None
    used_assets: set = set()  # track subdomains already in the chain

    # ────────────────────────────────────────
    # STAGE 1: INITIAL ACCESS
    # ────────────────────────────────────────
    # Priority: admin + sensitive ports > admin + web > sensitive + web > web-only
    for asset in candidates:
        sub = asset.get("subdomain", "unknown")
        ports = set(asset.get("open_ports", []))
        is_web = bool(ports & PUBLIC_WEB_PORTS)
        is_admin = _is_admin_surface(sub)
        has_sensitive = bool(ports - PUBLIC_WEB_PORTS)
        has_density = _has_high_service_density(asset)

        # Must have at least one qualifying vector
        if not (is_web or has_sensitive or is_admin or has_density):
            continue

        # Pick the best technique key
        if is_admin and has_sensitive:
            tech_key = "initial_access_admin"
        elif has_sensitive and not is_web:
            tech_key = "initial_access_remote"
        else:
            tech_key = "initial_access_web"

        extra = []
        if has_density:
            extra.append(f"High service density ({len(ports)} ports exposed)")

        step_num += 1
        attack_path.append(_make_step(step_num, "Initial Access", tech_key, asset, extra))
        entry_point = sub
        used_assets.add(sub)
        break

    # ────────────────────────────────────────
    # STAGE 2: PRIVILEGE ESCALATION
    # ────────────────────────────────────────
    # Triggered by database or remote-access ports
    seen_privesc_techniques: set = set()
    for asset in candidates:
        sub = asset.get("subdomain", "unknown")
        technique_keys = _has_sensitive_ports(asset)

        for key in technique_keys:
            if key in seen_privesc_techniques:
                continue
            seen_privesc_techniques.add(key)

            port = [p for p, k in SENSITIVE_PORT_MAP.items() if k == key][0]
            extra = [f"Port {port} directly accessible from external network"]

            step_num += 1
            attack_path.append(_make_step(step_num, "Privilege Escalation", key, asset, extra))
            used_assets.add(sub)

    # ────────────────────────────────────────
    # STAGE 3: LATERAL MOVEMENT
    # ────────────────────────────────────────
    # 3a: Shared infrastructure (ip_frequency > 2)
    shared_ips_processed: set = set()
    for asset in candidates:
        ip = asset.get("ip")
        sub = asset.get("subdomain", "unknown")
        if not ip or ip in shared_ips_processed:
            continue

        freq = ip_freq.get(ip, 1)
        if freq > 2:
            shared_ips_processed.add(ip)
            extra = [f"{freq} subdomains share IP {ip} — blast radius amplified"]

            step_num += 1
            attack_path.append(_make_step(step_num, "Lateral Movement", "lateral_shared_infra", asset, extra))
            used_assets.add(sub)
            break  # One shared-infra step is sufficient

    # 3b: Admin surface pivot (if not already entry point)
    for asset in candidates:
        sub = asset.get("subdomain", "unknown")
        if sub in used_assets:
            continue
        if _is_admin_surface(sub):
            step_num += 1
            attack_path.append(_make_step(step_num, "Lateral Movement", "lateral_admin", asset))
            used_assets.add(sub)
            break

    # 3c: Non-production environment pivot
    for asset in candidates:
        sub = asset.get("subdomain", "unknown")
        if sub in used_assets:
            continue
        if _is_env_surface(sub) and not _is_admin_surface(sub):
            step_num += 1
            attack_path.append(_make_step(step_num, "Lateral Movement", "lateral_env", asset))
            used_assets.add(sub)
            break

    # ────────────────────────────────────────
    # STAGE 4: DATA EXFILTRATION
    # ────────────────────────────────────────
    # Triggered by database ports exposed + admin context
    for asset in candidates:
        sub = asset.get("subdomain", "unknown")
        db_ports = _has_database_ports(asset)
        if not db_ports:
            continue

        # Admin + database = high-severity exfil path
        if _is_admin_surface(sub) and _has_non_web_ports(asset):
            tech_key = "exfil_admin_db"
            extra = [
                f"Database port(s) {db_ports} exposed alongside admin interface",
                "Admin + database combination enables direct data exfiltration",
            ]
        else:
            tech_key = "exfil_db"
            extra = [f"Database port(s) {db_ports} externally accessible"]

        step_num += 1
        attack_path.append(_make_step(step_num, "Data Exfiltration", tech_key, asset, extra))
        break  # One exfil step

    # ── Entry point fallback ──
    if entry_point is None:
        entry_point = candidates[0].get("subdomain", domain)

    # ── Impact summary ──
    overall_risk = _classify_overall_risk(attack_path)
    total_candidates = len(candidates)
    max_risk = candidates[0].get("risk_score", 0)
    stages_hit = list(dict.fromkeys(s["stage"] for s in attack_path))

    impact_summary = (
        f"Analysis of {domain} identified {total_candidates} asset(s) with elevated risk "
        f"(score >= {risk_threshold}). Peak risk score: {max_risk}. "
        f"A {len(attack_path)}-step attack chain spanning "
        f"{', '.join(stages_hit) if stages_hit else 'no'} stage(s) was constructed."
    )

    result = {
        "entry_point": entry_point,
        "attack_path": attack_path,
        "impact_summary": impact_summary,
        "overall_risk": overall_risk,
    }

    logger.info(
        "Deterministic attack graph for %s: %d steps, risk=%s",
        domain, len(attack_path), overall_risk,
    )

    return result
