"""Fully simulated IP -> location table.

None of these IPs are geolocated in real time; they are a fixed,
fictional lookup table used purely to plot points on the map, as
required by the project spec (section 15).
"""

SIMULATED_LOCATIONS: dict[str, dict] = {
    "185.220.12.42": {"country": "Germany", "lat": 51.1657, "lng": 10.4515},
    "91.214.44.21": {"country": "United States", "lat": 39.0997, "lng": -94.5786},
    "45.83.12.8": {"country": "Spain", "lat": 40.4168, "lng": -3.7038},
    "103.94.20.5": {"country": "China", "lat": 39.9042, "lng": 116.4074},
    "197.210.55.19": {"country": "Nigeria", "lat": 9.0820, "lng": 8.6753},
    "201.55.12.90": {"country": "Brazil", "lat": -14.2350, "lng": -51.9253},
    "62.210.88.3": {"country": "France", "lat": 46.2276, "lng": 2.2137},
    "5.188.10.44": {"country": "Russia", "lat": 61.5240, "lng": 105.3188},
    "103.21.244.7": {"country": "India", "lat": 20.5937, "lng": 78.9629},
    "41.86.32.11": {"country": "Egypt", "lat": 26.8206, "lng": 30.8025},
    "192.168.1.42": {"country": "Internal Network", "lat": 40.4168, "lng": -3.7038},
    "192.168.1.77": {"country": "Internal Network", "lat": 40.4168, "lng": -3.7038},
}

EXTERNAL_ATTACK_IPS = [
    ip for ip in SIMULATED_LOCATIONS if not ip.startswith("192.168.")
]


def location_for_ip(ip: str) -> dict | None:
    return SIMULATED_LOCATIONS.get(ip)