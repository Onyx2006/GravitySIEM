import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert
from app.schemas import AlertOut

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    severity: str | None = None,
    status: str | None = None,
    limit: int = Query(100, ge=1, le=500),
):
    stmt = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if severity:
        stmt = stmt.where(Alert.severity == severity.upper())
    if status:
        stmt = stmt.where(Alert.status == status.upper())
    return db.execute(stmt).scalars().all()


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: uuid.UUID, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert