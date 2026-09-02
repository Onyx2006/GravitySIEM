from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.detection.rules import RULES
from app.models import Alert
from app.schemas import MitreTechniqueOut

router = APIRouter(prefix="/api/mitre", tags=["mitre"])


@router.get("", response_model=list[MitreTechniqueOut])
def list_mitre_techniques(db: Session = Depends(get_db)):
    counts = dict(
        db.execute(
            select(Alert.mitre_technique, func.count(Alert.id)).group_by(Alert.mitre_technique)
        ).all()
    )

    seen: dict[str, MitreTechniqueOut] = {}
    for rule in RULES:
        seen[rule.mitre_technique] = MitreTechniqueOut(
            technique_id=rule.mitre_technique,
            name=rule.mitre_technique_name,
            tactic=rule.mitre_tactic,
            alert_count=counts.get(rule.mitre_technique, 0),
        )
    return list(seen.values())