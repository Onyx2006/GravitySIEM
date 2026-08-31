import random
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.detection.engine import evaluate_event
from app.models import Event
from app.services import websocket_manager
from app.services.geo import EXTERNAL_ATTACK_IPS
from app.services.incidents import correlate_alert

INTERNAL_HOSTS = ["web-01", "web-02", "db-primary", "auth-svc", "vpn-gw", "fileserver-01"]
INTERNAL_IPS = ["192.168.1.10", "192.168.1.11", "192.168.1.20", "192.168.1.30"]
USERS = ["admin", "root", "jsmith", "mgarcia", "svc_backup", "guest"]

SOURCE_SYSTEMS = ["linux", "windows", "firewall", "web_server", "database", "auth_server"]

BENIGN_EVENT_TYPES = [
    ("AUTH_SUCCESS", "LOW"),
    ("FILE_ACCESS", "LOW"),
    ("SERVICE_RESTART", "LOW"),
    ("CONFIG_CHANGE", "MEDIUM"),
    ("HTTP_REQUEST", "LOW"),
    ("DB_QUERY", "LOW"),
]


def _rand_internal_ip() -> str:
    return random.choice(INTERNAL_IPS)


def _rand_external_ip() -> str:
    return random.choice(EXTERNAL_ATTACK_IPS)


def ingest_event(db: Session, payload: dict) -> tuple[Event, list]:
    """Persist an event, run it through the detection engine and
    incident correlation, then broadcast everything over the WebSocket.

    This is the single funnel every event source (background generator
    or attack simulator) goes through, per the architecture diagram.
    """
    event = Event(
        id=uuid.uuid4(),
        timestamp=payload.get("timestamp") or datetime.now(timezone.utc),
        source_ip=payload["source_ip"],
        destination_ip=payload.get("destination_ip"),
        source_port=payload.get("source_port"),
        destination_port=payload.get("destination_port"),
        protocol=payload.get("protocol"),
        event_type=payload["event_type"],
        source_system=payload.get("source_system", "unknown"),
        username=payload.get("username"),
        hostname=payload.get("hostname"),
        message=payload.get("message"),
        severity=payload.get("severity", "LOW"),
        event_metadata=payload.get("metadata", {}),
    )
    db.add(event)
    db.flush()

    alerts = evaluate_event(db, event)

    incidents = []
    for alert in alerts:
        incident = correlate_alert(db, alert)
        incidents.append(incident)

    db.commit()
    db.refresh(event)
    for alert in alerts:
        db.refresh(alert)
    for incident in incidents:
        db.refresh(incident)

    websocket_manager.manager.enqueue_event(event)
    for alert in alerts:
        websocket_manager.manager.enqueue_alert(alert)
    for incident in incidents:
        websocket_manager.manager.enqueue_incident(incident)

    return event, alerts


def generate_benign_event() -> dict:
    """A random, harmless background event to keep the SOC feed alive."""
    event_type, severity = random.choice(BENIGN_EVENT_TYPES)
    is_internal = random.random() < 0.85
    return {
        "source_ip": _rand_internal_ip() if is_internal else _rand_external_ip(),
        "destination_ip": _rand_internal_ip(),
        "destination_port": random.choice([22, 80, 443, 3306, 5432, 8080]),
        "protocol": random.choice(["TCP", "HTTP", "HTTPS"]),
        "event_type": event_type,
        "source_system": random.choice(SOURCE_SYSTEMS),
        "username": random.choice(USERS) if "AUTH" in event_type else None,
        "hostname": random.choice(INTERNAL_HOSTS),
        "message": f"{event_type} recorded on {random.choice(INTERNAL_HOSTS)}",
        "severity": severity,
    }