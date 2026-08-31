"""Incident correlation.

Simple but real correlation rule: alerts that share the same
`source_ip` and `mitre_technique`, and fall within the configured
correlation time window of each other, are grouped into a single
Incident instead of creating a new one per alert.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Alert, Incident

SEVERITY_RANK = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}


def _max_severity(a: str, b: str) -> str:
    return a if SEVERITY_RANK.get(a, 0) >= SEVERITY_RANK.get(b, 0) else b


def correlate_alert(db: Session, alert: Alert) -> Incident:
    """Attach `alert` to an existing open incident if one matches, else create one."""
    window_start = (alert.created_at or datetime.now(timezone.utc)) - timedelta(
        seconds=settings.incident_correlation_window_seconds
    )

    stmt = (
        select(Incident)
        .where(
            Incident.source_ip == alert.source_ip,
            Incident.mitre_technique == alert.mitre_technique,
            Incident.last_seen >= window_start,
            Incident.status.not_in(["RESOLVED", "FALSE_POSITIVE"]),
        )
        .order_by(Incident.last_seen.desc())
        .limit(1)
    )
    incident = db.execute(stmt).scalar_one_or_none()

    if incident is None:
        incident = Incident(
            title=alert.title,
            description=alert.description,
            severity=alert.severity,
            status="OPEN",
            source_ip=alert.source_ip,
            mitre_technique=alert.mitre_technique,
            first_seen=alert.created_at,
            last_seen=alert.created_at,
            event_count=1,
            alert_count=1,
        )
        db.add(incident)
        db.flush()
    else:
        incident.last_seen = alert.created_at
        incident.severity = _max_severity(incident.severity, alert.severity)
        incident.alert_count += 1
        incident.event_count += 1
        if incident.status == "RESOLVED":
            incident.status = "OPEN"

    alert.incident_id = incident.id
    db.flush()
    return incident