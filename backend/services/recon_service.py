import logging
from typing import List, Dict, Any
from collections import Counter
from recon.subdomain import fetch_subdomains
from recon.resolver import resolve_domain, clear_dns_cache
from recon.shodan_scan import scan_ip, clear_cache
from services.risk_service import calculate_risk, apply_global_posture_adjustment

logger = logging.getLogger("recon_service")


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
    # Clear caches from any previous scan
    clear_cache()
    clear_dns_cache()

    logger.info("Starting recon for %s", domain)

    subdomains = fetch_subdomains(domain)
    logger.info("Enumerated %d subdomains for %s", len(subdomains), domain)

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

    logger.info("Resolved %d/%d subdomains to IPs", len(resolved), len(seen_subs))

    # Phase 2: Build IP frequency map
    ip_counts: Counter = Counter(entry["ip"] for entry in resolved)
    shared_ips = sum(1 for c in ip_counts.values() if c > 1)
    if shared_ips:
        logger.info("Detected %d shared IPs (infrastructure concentration)", shared_ips)

    # Phase 3: Scan + score each asset
    assets: List[Dict[str, Any]] = []
    for entry in resolved:
        ip = entry["ip"]
        sub = entry["subdomain"]

        try:
            scan_data = scan_ip(ip)
            open_ports = scan_data["ports"]
            services = scan_data.get("services", [])
        except Exception as e:
            logger.warning("Shodan scan failed for %s (%s): %s", sub, ip, str(e))
            open_ports = []
            services = []
            scan_data = {}

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

        # Enrich with Shodan metadata
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

    logger.info(
        "Recon complete for %s: %d assets, avg_risk=%.1f",
        domain,
        len(assets),
        sum(a["risk_score"] for a in assets) / len(assets) if assets else 0,
    )

    return assets
