"""
DNS Resolver Module — Attack Surface Intelligence Platform

Provides robust DNS resolution with:
- Multi-address support (IPv4 + IPv6) via socket.getaddrinfo
- In-memory per-scan caching to avoid redundant lookups
- Timeout control (5s default) to prevent hanging
- Optional MX/TXT/CNAME record lookups via dnspython
- Full backward compatibility with recon_service.py
"""

import socket
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# In-memory DNS cache
# ---------------------------------------------------------------------------

class _DnsCache:
    """Lightweight in-memory cache for DNS resolution results."""

    def __init__(self) -> None:
        self._store: Dict[str, Dict[str, List[str]]] = {}

    def get(self, subdomain: str) -> Optional[Dict[str, List[str]]]:
        """Return cached result or None."""
        return self._store.get(subdomain)

    def set(self, subdomain: str, result: Dict[str, List[str]]) -> None:
        """Store a resolution result."""
        self._store[subdomain] = result

    def clear(self) -> None:
        """Flush all cached entries."""
        self._store.clear()


_cache = _DnsCache()


def clear_dns_cache() -> None:
    """Public helper to reset the DNS cache between scan runs."""
    _cache.clear()


# ---------------------------------------------------------------------------
# Core resolution
# ---------------------------------------------------------------------------

_DNS_TIMEOUT: int = 5  # seconds


def resolve_domain_full(subdomain: str) -> Dict[str, List[str]]:
    """
    Resolve a subdomain to all available IP addresses.

    Returns:
        {
            "ipv4": ["1.2.3.4", ...],
            "ipv6": ["2001:db8::1", ...]
        }
        Empty lists if resolution fails.
    """
    # Check cache first
    cached = _cache.get(subdomain)
    if cached is not None:
        return cached

    ipv4: List[str] = []
    ipv6: List[str] = []

    # Temporarily apply timeout, then restore original
    original_timeout = socket.getdefaulttimeout()
    try:
        socket.setdefaulttimeout(_DNS_TIMEOUT)

        # Resolve all address families (AF_UNSPEC = both IPv4 + IPv6)
        addr_infos = socket.getaddrinfo(
            subdomain, None, socket.AF_UNSPEC, socket.SOCK_STREAM
        )

        seen: set = set()
        for family, _, _, _, sockaddr in addr_infos:
            ip = sockaddr[0]
            if ip in seen:
                continue
            seen.add(ip)

            if family == socket.AF_INET:
                ipv4.append(ip)
            elif family == socket.AF_INET6:
                ipv6.append(ip)

    except socket.gaierror:
        pass  # domain does not resolve
    except socket.timeout:
        pass  # resolution timed out
    except Exception:
        pass  # unexpected error — fail gracefully
    finally:
        socket.setdefaulttimeout(original_timeout)

    result: Dict[str, List[str]] = {"ipv4": ipv4, "ipv6": ipv6}
    _cache.set(subdomain, result)
    return result


def resolve_domain(subdomain: str) -> Optional[str]:
    """
    Resolve a subdomain to its primary IPv4 address.

    Backward-compatible drop-in replacement for the original function.
    Returns the first resolved IPv4 address, or None if resolution fails.
    """
    result = resolve_domain_full(subdomain)
    return result["ipv4"][0] if result["ipv4"] else None


def resolve_primary_ip(subdomain: str) -> Optional[str]:
    """
    Alias for resolve_domain — returns the first IPv4 address.

    Provided as an explicit helper per the upgrade spec.
    """
    return resolve_domain(subdomain)


# ---------------------------------------------------------------------------
# Optional DNS record lookups (MX, TXT, CNAME) via dnspython
# ---------------------------------------------------------------------------

def resolve_dns_records(domain: str) -> Dict[str, List[str]]:
    """
    Query MX, TXT, and CNAME records for a domain.

    Requires the ``dnspython`` package. If not installed or if any lookup
    fails, returns empty lists — never blocks the scan pipeline.

    Returns:
        {
            "mx":    ["mail.example.com", ...],
            "txt":   ["v=spf1 ...", ...],
            "cname": ["alias.example.com", ...]
        }
    """
    records: Dict[str, List[str]] = {"mx": [], "txt": [], "cname": []}

    try:
        import dns.resolver  # type: ignore[import-untyped]
    except ImportError:
        # dnspython not installed — return empty gracefully
        return records

    resolver = dns.resolver.Resolver()
    resolver.lifetime = _DNS_TIMEOUT

    # MX records
    try:
        for rdata in resolver.resolve(domain, "MX"):
            records["mx"].append(str(rdata.exchange).rstrip("."))
    except Exception:
        pass

    # TXT records
    try:
        for rdata in resolver.resolve(domain, "TXT"):
            records["txt"].append(str(rdata).strip('"'))
    except Exception:
        pass

    # CNAME records
    try:
        for rdata in resolver.resolve(domain, "CNAME"):
            records["cname"].append(str(rdata.target).rstrip("."))
    except Exception:
        pass

    return records
