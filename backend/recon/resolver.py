import socket
from typing import Optional


def resolve_domain(subdomain: str) -> Optional[str]:
    """
    Resolve a subdomain to its IP address.
    Returns None if resolution fails.
    """
    try:
        ip = socket.gethostbyname(subdomain)
        return ip
    except socket.gaierror:
        return None
    except Exception:
        return None
