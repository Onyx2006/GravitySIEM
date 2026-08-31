from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert
from app.services.geo import location_for_ip

router = APIRouter(prefix="/api/map", tags=["map"])


@router.get("/sources")
def get_attack_sources(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Alert.source_ip, func.count(Alert.id).label("cnt"), func.max(Alert.severity))
        .group_by(Alert.source_ip)
    ).all()

    sources = []
    for source_ip, count, _ in rows:
        location = location_for_ip(source_ip)
        if not location:
            continue
        sources.append(
            {
                "source_ip": source_ip,
                "alert_count": count,
                "country": location["country"],
                "lat": location["lat"],
                "lng": location["lng"],
            }
        )
    return sources