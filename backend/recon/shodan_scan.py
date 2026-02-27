import shodan
from typing import List
from core.config import SHODAN_API_KEY


def scan_ip(ip: str) -> List[int]:
    """
    Use Shodan API to retrieve open ports for a given IP.
    Returns a list of open port numbers.
    """
    if not SHODAN_API_KEY:
        return []

    try:
        api = shodan.Shodan(SHODAN_API_KEY)
        host = api.host(ip)
        ports = host.get("ports", [])
        return ports
    except shodan.APIError:
        # IP not found in Shodan or API error
        return []
    except Exception:
        return []
