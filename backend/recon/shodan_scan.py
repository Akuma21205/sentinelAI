import shodan
from typing import Dict, Any, List, Optional
from core.config import SHODAN_API_KEY

# Structured empty result for failed/missing lookups
EMPTY_RESULT: Dict[str, Any] = {
    "ports": [],
    "services": [],
    "os": None,
    "org": None,
    "isp": None,
}

# Lazy-initialized Shodan client
_shodan_client: Optional[shodan.Shodan] = None

# Per-IP result cache to avoid redundant API calls
_ip_cache: Dict[str, Dict[str, Any]] = {}


def _get_client() -> Optional[shodan.Shodan]:
    """Lazy-init Shodan client singleton."""
    global _shodan_client
    if _shodan_client is None and SHODAN_API_KEY:
        _shodan_client = shodan.Shodan(SHODAN_API_KEY)
    return _shodan_client


def _extract_services(host_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract structured service metadata from Shodan host['data'] entries.
    Each entry contains port, product, version, and transport info.
    """
    services: List[Dict[str, Any]] = []
    seen_ports: set = set()

    for entry in host_data:
        port = entry.get("port")
        if port is None or port in seen_ports:
            continue
        seen_ports.add(port)

        services.append({
            "port": port,
            "product": entry.get("product") or None,
            "version": entry.get("version") or None,
            "transport": entry.get("transport") or None,
        })

    return services


def scan_ip(ip: str) -> Dict[str, Any]:
    """
    Query Shodan for structured intelligence on an IP address.

    Returns:
    {
        "ports": [int, ...],
        "services": [{"port": int, "product": str, "version": str, "transport": str}, ...],
        "os": str or None,
        "org": str or None,
        "isp": str or None
    }

    Results are cached per-IP to avoid redundant API calls
    when multiple subdomains resolve to the same IP.
    """
    if not SHODAN_API_KEY:
        return dict(EMPTY_RESULT)

    # Return cached result if already scanned
    if ip in _ip_cache:
        return _ip_cache[ip]

    client = _get_client()
    if not client:
        return dict(EMPTY_RESULT)

    try:
        host = client.host(ip)

        result: Dict[str, Any] = {
            "ports": host.get("ports", []),
            "services": _extract_services(host.get("data", [])),
            "os": host.get("os") or None,
            "org": host.get("org") or None,
            "isp": host.get("isp") or None,
        }

        _ip_cache[ip] = result
        return result

    except shodan.APIError:
        # IP not found in Shodan or API error
        _ip_cache[ip] = dict(EMPTY_RESULT)
        return dict(EMPTY_RESULT)
    except Exception:
        # Network/timeout/rate-limit issues
        _ip_cache[ip] = dict(EMPTY_RESULT)
        return dict(EMPTY_RESULT)


def clear_cache() -> None:
    """Clear the IP scan cache. Call between separate scan runs."""
    global _ip_cache
    _ip_cache = {}
