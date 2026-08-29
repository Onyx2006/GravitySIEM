"""Detection engine.

Generic, rule-driven logic: for every incoming event, look up rules
registered for that event_type, count how many matching events the
same source_ip produced inside the rule's time_window, and raise an
alert once the threshold is met. A cooldown avoids re-alerting on
every single subsequent event once a rule has already fired for that
source_ip within the same window.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.detection.rules import RULES_BY_EVENT_TYPE, RuleDefinition
from app.models import Alert, DetectionRule, Event


def _rule_recently_fired(db: Session, rule_id: str, source_ip: str, window_start: datetime) -> bool:
    stmt = select(Alert.id).where(
        Alert.rule_id == rule_id,
        Alert.source_ip == source_ip,
        Alert.created_at >= window_start,
    ).limit(1)
    return db.execute(stmt).first() is not None


def evaluate_event(db: Session, event: Event) -> list[Alert]:
    """Evaluate a freshly-inserted event against all applicable rules.

    Returns the list of newly created (and committed) Alert rows, if any.
    """
    candidate_rules = RULES_BY_EVENT_TYPE.get(event.event_type, [])
    if not candidate_rules:
        return []

    new_alerts: list[Alert] = []
    now = event.timestamp or datetime.now(timezone.utc)

    for rule_def in candidate_rules:
        db_rule = db.get(DetectionRule, rule_def.id)
        if db_rule is None or not db_rule.enabled:
            continue

        window_start = now - timedelta(seconds=db_rule.time_window)

        count_stmt = select(func.count(Event.id)).where(
            Event.event_type == event.event_type,
            Event.source_ip == event.source_ip,
            Event.timestamp >= window_start,
            Event.timestamp <= now,
        )
        matching_count = db.execute(count_stmt).scalar_one()

        if matching_count < db_rule.threshold:
            continue

        # Avoid spamming duplicate alerts for the same ongoing burst.
        if _rule_recently_fired(db, db_rule.id, event.source_ip, window_start):
            continue

        alert = Alert(
            event_id=event.id,
            rule_id=db_rule.id,
            title=rule_def.alert_title,
            description=(
                f"{matching_count} eventos de tipo {event.event_type} desde "
                f"{event.source_ip} en los ultimos {db_rule.time_window}s "
                f"(umbral: {db_rule.threshold})."
            ),
            severity=db_rule.severity,
            confidence=min(99, 60 + matching_count),
            source_ip=event.source_ip,
            mitre_tactic=db_rule.mitre_tactic,
            mitre_technique=db_rule.mitre_technique,
            status="NEW",
        )
        db.add(alert)
        new_alerts.append(alert)

    if new_alerts:
        db.flush()

    return new_alerts