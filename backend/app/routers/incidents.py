import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Event, Incident
from app.schemas import AlertOut, IncidentDetailOut, IncidentOut, IncidentTimelineItem, IncidentUpdate

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

VALID_STATUSES = {"OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"}


@router.get("", response_model=list[IncidentOut])
def list_incidents(
    db: Session = Depends(get_db),
    status: str | None = None,
    severity: str | None = None,
    limit: int = Query(100, ge=1, le=500),
):
    stmt = select(Incident).order_by(Incident.last_seen.desc()).limit(limit)
    if status:
        stmt = stmt.where(Incident.status == status.upper())
    if severity:
        stmt = stmt.where(Incident.severity == severity.upper())
    return db.execute(stmt).scalars().all()


@router.get("/{incident_id}", response_model=IncidentDetailOut)
def get_incident(incident_id: uuid.UUID, db: Session = Depends(get_db)):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    alerts = db.execute(
        select(Alert).where(Alert.incident_id == incident.id).order_by(Alert.created_at.asc())
    ).scalars().all()

    timeline: list[IncidentTimelineItem] = []
    for alert in alerts:
        if alert.event_id:
            event = db.get(Event, alert.event_id)
            if event:
                timeline.append(
                    IncidentTimelineItem(
                        timestamp=event.timestamp,
                        label=f"{event.event_type} from {event.source_ip}",
                        kind="event",
                    )
                )
        timeline.append(
            IncidentTimelineItem(
                timestamp=alert.created_at,
                label=f"Alert raised: {alert.title}",
                kind="alert",
            )
        )
    timeline.sort(key=lambda item: item.timestamp)

    return IncidentDetailOut(
        **IncidentOut.model_validate(incident).model_dump(),
        timeline=timeline,
        alerts=[AlertOut.model_validate(a) for a in alerts],
    )


@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(incident_id: uuid.UUID, payload: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    new_status = payload.status.upper()
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {sorted(VALID_STATUSES)}")

    incident.status = new_status
    db.commit()
    db.refresh(incident)
    return incident