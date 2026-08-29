"""Seed data.

Runs once at startup (idempotent). Loads the rule catalog into
`detection_rules`, then — if the database is empty — replays a handful
of simulated attack bursts spread over the last hour so the dashboard
never opens to an empty screen (section 20 of the spec).
"""

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.detection.rules import RULES
from app.models import DetectionRule, Event
from app.services.events import generate_benign_event, ingest_event
from app.services.geo import EXTERNAL_ATTACK_IPS


def seed_rules(db: Session) -> None:
    for rule_def in RULES:
        existing = db.get(DetectionRule, rule_def.id)
        if existing:
            continue
        db.add(
            DetectionRule(
                id=rule_def.id,
                name=rule_def.name,
                description=rule_def.description,
                severity=rule_def.severity,
                threshold=rule_def.threshold,
                time_window=rule_def.time_window,
                event_type=rule_def.event_type,
                mitre_tactic=rule_def.mitre_tactic,
                mitre_technique=rule_def.mitre_technique,
                mitre_technique_name=rule_def.mitre_technique_name,
                enabled=True,
            )
        )
    db.commit()


def _historical_payload(minutes_ago: int, **overrides) -> dict:
    payload = {
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=minutes_ago),
    }
    payload.update(overrides)
    return payload


def seed_history(db: Session) -> None:
    existing = db.execute(select(Event.id).limit(1)).first()
    if existing:
        return  # already seeded

    # Background noise across the last 90 minutes.
    for minute in range(90, 0, -3):
        for _ in range(random.randint(1, 3)):
            payload = generate_benign_event()
            payload["timestamp"] = datetime.now(timezone.utc) - timedelta(minutes=minute)
            ingest_event(db, payload)

    # A resolved-looking brute force burst ~40 minutes ago.
    attacker = random.choice(EXTERNAL_ATTACK_IPS)
    for i in range(14):
        ingest_event(
            db,
            _historical_payload(
                minutes_ago=40,
                source_ip=attacker,
                destination_ip="192.168.1.10",
                destination_port=22,
                protocol="SSH",
                event_type="AUTH_FAILURE",
                username="admin",
                source_system="auth_server",
                hostname="web-01",
                message=f"Failed SSH login attempt from {attacker}",
                severity="LOW",
            ),
        )

    # A SQL injection burst ~15 minutes ago.
    attacker2 = random.choice([ip for ip in EXTERNAL_ATTACK_IPS if ip != attacker])
    for i in range(6):
        ingest_event(
            db,
            _historical_payload(
                minutes_ago=15,
                source_ip=attacker2,
                destination_ip="192.168.1.10",
                destination_port=443,
                protocol="HTTPS",
                event_type="SQL_INJECTION",
                source_system="web_server",
                hostname="web-01",
                message="Suspicious query parameter detected: ' OR 1=1 --",
                severity="MEDIUM",
                metadata={"payload": "' OR 1=1 --", "path": "/api/login"},
            ),
        )

    # A malware detection a few minutes ago.
    ingest_event(
        db,
        _historical_payload(
            minutes_ago=6,
            source_ip="192.168.1.20",
            destination_ip="192.168.1.20",
            protocol="N/A",
            event_type="MALWARE_DETECTED",
            source_system="linux",
            hostname="fileserver-01",
            message="Endpoint agent flagged suspicious file: trojan.generic.simulated",
            severity="CRITICAL",
            metadata={"signature": "trojan.generic.simulated"},
        ),
    )


def run_seed(db: Session) -> None:
    seed_rules(db)
    seed_history(db)