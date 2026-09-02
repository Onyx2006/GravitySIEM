from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Event, Incident
from app.schemas import StatsOut

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)

    total_events = db.execute(select(func.count(Event.id))).scalar_one()

    active_alerts = db.execute(
        select(func.count(Alert.id)).where(Alert.status != "CLOSED")
    ).scalar_one()

    critical_alerts = db.execute(
        select(func.count(Alert.id)).where(Alert.severity == "CRITICAL", Alert.status != "CLOSED")
    ).scalar_one()

    open_incidents = db.execute(
        select(func.count(Incident.id)).where(Incident.status.not_in(["RESOLVED", "FALSE_POSITIVE"]))
    ).scalar_one()

    one_min_ago = now - timedelta(minutes=1)
    events_last_minute = db.execute(
        select(func.count(Event.id)).where(Event.timestamp >= one_min_ago)
    ).scalar_one()

    severity_rows = db.execute(
        select(Event.severity, func.count(Event.id)).group_by(Event.severity)
    ).all()
    severity_breakdown = {row[0]: row[1] for row in severity_rows}

    type_rows = db.execute(
        select(Event.event_type, func.count(Event.id)).group_by(Event.event_type)
    ).all()
    event_type_breakdown = {row[0]: row[1] for row in type_rows}

    top_sources_rows = db.execute(
        select(Event.source_ip, func.count(Event.id).label("cnt"))
        .group_by(Event.source_ip)
        .order_by(func.count(Event.id).desc())
        .limit(10)
    ).all()
    top_sources = [{"source_ip": row[0], "count": row[1]} for row in top_sources_rows]

    # Threat activity: events per 5-minute bucket for the last 2 hours
    two_hours_ago = now - timedelta(hours=2)
    activity_rows = db.execute(
        select(Event.timestamp, Event.severity).where(Event.timestamp >= two_hours_ago)
    ).all()
    buckets: dict[str, dict[str, int]] = {}
    for timestamp, severity in activity_rows:
        bucket_key = timestamp.replace(minute=(timestamp.minute // 5) * 5, second=0, microsecond=0).isoformat()
        buckets.setdefault(bucket_key, {"events": 0, "threats": 0})
        buckets[bucket_key]["events"] += 1
        if severity in ("HIGH", "CRITICAL"):
            buckets[bucket_key]["threats"] += 1
    threat_activity = [
        {"timestamp": key, **value} for key, value in sorted(buckets.items())
    ]

    return StatsOut(
        total_events=total_events,
        active_alerts=active_alerts,
        critical_alerts=critical_alerts,
        open_incidents=open_incidents,
        events_per_minute=float(events_last_minute),
        severity_breakdown=severity_breakdown,
        event_type_breakdown=event_type_breakdown,
        top_sources=top_sources,
        threat_activity=threat_activity,
    )