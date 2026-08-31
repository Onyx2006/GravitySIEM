from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DetectionRule
from app.schemas import DetectionRuleOut, DetectionRuleUpdate

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("", response_model=list[DetectionRuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.execute(select(DetectionRule).order_by(DetectionRule.id)).scalars().all()


@router.patch("/{rule_id}", response_model=DetectionRuleOut)
def update_rule(rule_id: str, payload: DetectionRuleUpdate, db: Session = Depends(get_db)):
    rule = db.get(DetectionRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.enabled = payload.enabled
    db.commit()
    db.refresh(rule)
    return rule