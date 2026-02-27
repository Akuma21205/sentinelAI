from typing import List, Dict, Any
from collections import Counter
from recon.subdomain import fetch_subdomains
from recon.resolver import resolve_domain
from recon.shodan_scan import scan_ip, clear_cache
from services.risk_service import calculate_risk, apply_global_posture_adjustment


def run_recon(domain: str) -> List[Dict[str, Any]]:
    """
    Full recon pipeline:
    1. Enumerate subdomains (crt.sh + brute-force + DNS validation)
    2. Resolve each subdomain to IP
    3. Query Shodan for structured intelligence (cached per IP)
    4. Build IP frequency map for shared infrastructure detection
    5. Score risk per asset (Layers 1-3)
    6. Apply global posture adjustment (Layer 4)
    Returns a list of enriched asset dictionaries.
    """
    # Clear Shodan cache from any previous scan
    clear_cache()

    subdomains = fetch_subdomains(domain)

    # Phase 1: Resolve all subdomains and collect IPs
    resolved: List[Dict[str, Any]] = []
    seen_subs: set = set()
    for sub in subdomains:
        if sub in seen_subs:
            continue
        seen_subs.add(sub)

        ip = resolve_domain(sub)
        if not ip:
            continue
        resolved.append({"subdomain": sub, "ip": ip})

    # Phase 2: Build IP frequency map
    ip_counts: Counter = Counter(entry["ip"] for entry in resolved)

    # Phase 3: Scan + score each asset
    assets: List[Dict[str, Any]] = []
    for entry in resolved:
        ip = entry["ip"]
        sub = entry["subdomain"]

        # Shodan now returns structured data
        scan_data = scan_ip(ip)
        open_ports = scan_data["ports"]
        services = scan_data.get("services", [])

        risk_score, severity, risk_factors = calculate_risk(
            subdomain=sub,
            open_ports=open_ports,
            ip_frequency=ip_counts[ip],
        )

        asset: Dict[str, Any] = {
            "subdomain": sub,
            "ip": ip,
            "open_ports": open_ports,
            "risk_score": risk_score,
            "severity": severity,
            "risk_factors": risk_factors,
        }

        # Enrich with Shodan metadata (if available)
        if services:
            asset["services"] = services
        if scan_data.get("os"):
            asset["os"] = scan_data["os"]
        if scan_data.get("org"):
            asset["org"] = scan_data["org"]
        if scan_data.get("isp"):
            asset["isp"] = scan_data["isp"]

        assets.append(asset)

    # Phase 4: Global posture adjustment (Layer 4)
    assets = apply_global_posture_adjustment(assets)

    return assets
