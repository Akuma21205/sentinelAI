import requests
from typing import List


def fetch_subdomains(domain: str) -> List[str]:
    """
    Fetch subdomains using crt.sh certificate transparency logs.
    Returns the first 10 unique subdomains found.
    """
    url = f"https://crt.sh/?q=%25.{domain}&output=json"

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch subdomains from crt.sh: {str(e)}")
    except ValueError:
        raise Exception("Invalid JSON response from crt.sh")

    subdomains: set = set()

    for entry in data:
        name_value = entry.get("name_value", "")
        # crt.sh can return multiple names separated by newlines
        for name in name_value.split("\n"):
            name = name.strip().lower()
            # Skip wildcard entries and empty strings
            if name and not name.startswith("*") and name.endswith(f".{domain}"):
                subdomains.add(name)
            # Also include the root domain itself if present
            elif name == domain:
                subdomains.add(name)

    # Limit to first 10 results
    return list(subdomains)[:10]
