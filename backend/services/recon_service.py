from typing import List, Dict, Any
from recon.subdomain import fetch_subdomains
from recon.resolver import resolve_domain
from recon.shodan_scan import scan_ip
from services.risk_service import calculate_risk


def run_recon(domain: str) -> List[Dict[str, Any]]:
    """
    Full recon pipeline:
    1. Enumerate subdomains via crt.sh
    2. Resolve each subdomain to IP
    3. Scan each IP via Shodan for open ports
    4. Score risk for each asset
    Returns a list of asset dictionaries.
    """
    subdomains = fetch_subdomains(domain)
    assets: List[Dict[str, Any]] = []

    for sub in subdomains:
        ip = resolve_domain(sub)
        if not ip:
            continue

        open_ports = scan_ip(ip)
        risk_score, severity = calculate_risk(sub, open_ports)

        assets.append({
            "subdomain": sub,
            "ip": ip,
            "open_ports": open_ports,
            "risk_score": risk_score,
            "severity": severity,
        })

    return assets
