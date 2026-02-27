import socket
import requests
from typing import List

# Common subdomain prefixes for lightweight brute-force discovery
COMMON_SUBS = ["dev", "test", "staging", "admin", "api", "mail", "portal", "beta"]

# Max subdomains to return
MAX_SUBDOMAINS = 15


def _is_resolvable(hostname: str) -> bool:
    """Check if a hostname resolves to an IP via DNS."""
    try:
        socket.gethostbyname(hostname)
        return True
    except (socket.gaierror, OSError):
        return False


def _fetch_from_crtsh(domain: str) -> List[str]:
    """
    Fetch subdomains from crt.sh certificate transparency logs.
    Returns a list of raw subdomain names (may include wildcards).
    """
    url = f"https://crt.sh/?q=%25.{domain}&output=json"

    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()

        if not response.text.strip():
            return []

        data = response.json()
    except requests.RequestException:
        # crt.sh is unreliable — fail silently and rely on brute-force
        return []
    except (ValueError, TypeError):
        # Malformed JSON
        return []

    if not isinstance(data, list):
        return []

    raw_names: List[str] = []
    for entry in data:
        name_value = entry.get("name_value")
        if not name_value or not isinstance(name_value, str):
            continue

        # crt.sh can return multiple names separated by newlines
        for name in name_value.split("\n"):
            name = name.strip().lower()
            if name:
                raw_names.append(name)

    return raw_names


def _brute_prefix_discovery(domain: str) -> List[str]:
    """
    Lightweight controlled brute-force: check common subdomain prefixes
    against DNS resolution. Returns only resolvable subdomains.
    """
    discovered: List[str] = []
    for prefix in COMMON_SUBS:
        candidate = f"{prefix}.{domain}"
        if _is_resolvable(candidate):
            discovered.append(candidate)
    return discovered


def fetch_subdomains(domain: str) -> List[str]:
    """
    Multi-source subdomain enumeration:
    1. crt.sh certificate transparency
    2. Lightweight brute-force prefix check
    3. DNS resolution validation

    Returns up to MAX_SUBDOMAINS unique, lowercase, DNS-validated subdomains.
    Always includes the root domain if it resolves.
    """
    domain = domain.strip().lower()
    subdomains: set = set()

    # Source 1: crt.sh
    crt_results = _fetch_from_crtsh(domain)
    for name in crt_results:
        # Skip wildcards and malformed entries
        if name.startswith("*"):
            continue
        # Must belong to target domain
        if name == domain or name.endswith(f".{domain}"):
            subdomains.add(name)

    # Source 2: Brute-force prefix discovery
    brute_results = _brute_prefix_discovery(domain)
    for name in brute_results:
        subdomains.add(name)

    # Always include root domain
    subdomains.add(domain)

    # DNS resolution validation — only keep resolvable subdomains
    validated: List[str] = []
    for sub in subdomains:
        if _is_resolvable(sub):
            validated.append(sub)
        if len(validated) >= MAX_SUBDOMAINS:
            break

    return validated
