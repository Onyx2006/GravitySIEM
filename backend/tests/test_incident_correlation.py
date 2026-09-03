from datetime import datetime, timezone

from app.models import Alert
from app.services.incidents import correlate_alert


def _make_alert(source_ip="203.0.113.9", technique="T1110", severity="HIGH"):
    return Alert(
        rule_id="RULE-001",
        title="SSH Brute Force Attack Detected",
        description="test",
        severity=severity,
        confidence=80,
        source_ip=source_ip,
        mitre_tactic="Credential Access",
        mitre_technique=technique,
        status="NEW",
        created_at=datetime.now(timezone.utc),
    )


def test_first_alert_creates_incident(db_session):
    alert = _make_alert()
    db_session.add(alert)
    db_session.flush()

    incident = correlate_alert(db_session, alert)
    assert incident.alert_count == 1
    assert incident.source_ip == "203.0.113.9"


def test_second_matching_alert_joins_same_incident(db_session):
    alert1 = _make_alert()
    db_session.add(alert1)
    db_session.flush()
    incident1 = correlate_alert(db_session, alert1)

    alert2 = _make_alert()
    db_session.add(alert2)
    db_session.flush()
    incident2 = correlate_alert(db_session, alert2)

    assert incident1.id == incident2.id
    assert incident2.alert_count == 2


def test_different_source_ip_creates_new_incident(db_session):
    alert1 = _make_alert(source_ip="203.0.113.9")
    db_session.add(alert1)
    db_session.flush()
    incident1 = correlate_alert(db_session, alert1)

    alert2 = _make_alert(source_ip="198.51.100.4")
    db_session.add(alert2)
    db_session.flush()
    incident2 = correlate_alert(db_session, alert2)

    assert incident1.id != incident2.id