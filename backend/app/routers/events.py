import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event
from app.schemas import EventOut

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=dict)
def list_events(
    db: Session = Depends(get_db),
    severity: str | None = None,
    event_type: str | None = None,
    source_ip: str | None = None,
    search: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    sort: str = Query("timestamp_desc", pattern="^(timestamp_desc|timestamp_asc|severity)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
):
    stmt = select(Event)

    if severity:
        stmt = stmt.where(Event.severity == severity.upper())
    if event_type:
        stmt = stmt.where(Event.event_type == event_type.upper())
    if source_ip:
        stmt = stmt.where(Event.source_ip.ilike(f"%{source_ip}%"))
    if search:
        like = f"%{search}%"
        stmt = stmt.where(Event.message.ilike(like))
    if date_from:
        stmt = stmt.where(Event.timestamp >= date_from)
    if date_to:
        stmt = stmt.where(Event.timestamp <= date_to)

    if sort == "timestamp_asc":
        stmt = stmt.order_by(Event.timestamp.asc())
    elif sort == "severity":
        stmt = stmt.order_by(Event.severity.desc(), Event.timestamp.desc())
    else:
        stmt = stmt.order_by(Event.timestamp.desc())

    total = len(db.execute(stmt).scalars().all())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    results = db.execute(stmt).scalars().all()

    return {
        "items": [EventOut.model_validate(e).model_dump() for e in results],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: uuid.UUID, db: Session = Depends(get_db)):
    event = db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event