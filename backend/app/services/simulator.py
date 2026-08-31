"""Attack Simulator.

Everything here only ever *writes rows to PostgreSQL* through
`events.ingest_event`. Nothing in this module opens a socket, sends a
real HTTP request, or touches any system outside this container. The
"attacks" are synthetic log lines shaped like the real thing, generated
on a short delay so the frontend can watch the detection engine react
in near real time.
"""

import asyncio
import random
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.services.events import ingest_event
from app.services.geo import EXTERNAL_ATTACK_IPS

TARGET_IP = "192.168.1.10"
TARGET_HOST = "web-01"

SQLI_PAYLOADS = [
    "' OR 1=1 --",
    "' OR '1'='1",
    "1; DROP TABLE users;",
    "' UNION SELECT username, password FROM users --",
    "admin'--",
]

XSS_PAYLOADS = [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "<svg/onload=alert('xss')>",
    "\"><script>document.location='http://evil.example'</script>",
]

MALWARE_NAMES = [
    "trojan.generic.simulated",
    "ransom.fake.demo",
    "worm.sample.edu",
    "backdoor.testfile.exe",
]


async def _emit(db_factory, payload: dict, delay: float) -> None:
    await asyncio.sleep(delay)
    db: Session = db_factory()
    try:
        ingest_event(db, payload)
    finally:
        db.close()


def _base_payload(**overrides) -> dict:
    payload = {
        "source_ip": TARGET_IP,
        "destination_ip": TARGET_IP,
        "hostname": TARGET_HOST,
        "source_system": "firewall",
        "timestamp": datetime.now(timezone.utc),
    }
    payload.update(overrides)
    return payload


async def run_ssh_brute_force(db_factory) -> int:
    attacker = random.choice(EXTERNAL_ATTACK_IPS)
    count = random.randint(12, 20)
    for i in range(count):
        payload = _base_payload(
            source_ip=attacker,
            destination_port=22,
            protocol="SSH",
            event_type="AUTH_FAILURE",
            username=random.choice(["admin", "root", "test"]),
            source_system="auth_server",
            message=f"Failed SSH login attempt #{i + 1} for user from {attacker}",
            severity="LOW",
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.4))
    return count


async def run_port_scan(db_factory) -> int:
    attacker = random.choice(EXTERNAL_ATTACK_IPS)
    ports = random.sample(range(20, 9000), 22)
    for i, port in enumerate(ports):
        payload = _base_payload(
            source_ip=attacker,
            destination_port=port,
            protocol="TCP",
            event_type="PORT_SCAN",
            source_system="firewall",
            message=f"Connection attempt to port {port} from {attacker}",
            severity="LOW",
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.3))
    return len(ports)


async def run_sql_injection(db_factory) -> int:
    attacker = random.choice(EXTERNAL_ATTACK_IPS)
    count = random.randint(6, 9)
    for i in range(count):
        payload_str = random.choice(SQLI_PAYLOADS)
        payload = _base_payload(
            source_ip=attacker,
            destination_port=443,
            protocol="HTTPS",
            event_type="SQL_INJECTION",
            source_system="web_server",
            message=f"Suspicious query parameter detected: {payload_str}",
            severity="MEDIUM",
            metadata={"payload": payload_str, "path": "/api/search"},
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.5))
    return count


async def run_xss(db_factory) -> int:
    attacker = random.choice(EXTERNAL_ATTACK_IPS)
    count = random.randint(6, 9)
    for i in range(count):
        payload_str = random.choice(XSS_PAYLOADS)
        payload = _base_payload(
            source_ip=attacker,
            destination_port=443,
            protocol="HTTPS",
            event_type="XSS_ATTEMPT",
            source_system="web_server",
            message=f"Suspicious input field payload detected: {payload_str}",
            severity="MEDIUM",
            metadata={"payload": payload_str, "path": "/comments"},
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.5))
    return count


async def run_suspicious_login(db_factory) -> int:
    count = random.randint(6, 8)
    attackers = random.sample(EXTERNAL_ATTACK_IPS, min(count, len(EXTERNAL_ATTACK_IPS)))
    for i, attacker in enumerate(attackers):
        payload = _base_payload(
            source_ip=attacker,
            destination_port=443,
            protocol="HTTPS",
            event_type="WEB_AUTH_FAILURE",
            source_system="auth_server",
            username="admin",
            message=f"Failed web login for 'admin' from unusual location ({attacker})",
            severity="LOW",
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.6))
    return len(attackers)


async def run_malware_detection(db_factory) -> int:
    malware = random.choice(MALWARE_NAMES)
    payload = _base_payload(
        source_ip=TARGET_IP,
        destination_ip=TARGET_IP,
        protocol="N/A",
        event_type="MALWARE_DETECTED",
        source_system="linux",
        hostname=random.choice(["web-01", "fileserver-01"]),
        message=f"Endpoint agent flagged suspicious file: {malware}",
        severity="CRITICAL",
        metadata={"signature": malware, "file_hash": uuid.uuid4().hex},
    )
    asyncio.create_task(_emit(db_factory, payload, delay=0.2))
    return 1


async def run_ddos(db_factory) -> int:
    attackers = random.sample(EXTERNAL_ATTACK_IPS, min(4, len(EXTERNAL_ATTACK_IPS)))
    count = random.randint(110, 140)
    for i in range(count):
        attacker = attackers[i % len(attackers)]
        payload = _base_payload(
            source_ip=attacker,
            destination_port=443,
            protocol="HTTPS",
            event_type="NETWORK_FLOOD",
            source_system="firewall",
            message=f"High-volume traffic burst from {attacker}",
            severity="LOW",
        )
        asyncio.create_task(_emit(db_factory, payload, delay=i * 0.08))
    return count