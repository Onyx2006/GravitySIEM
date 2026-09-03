from datetime import datetime, timedelta, timezone

from app.detection.engine import evaluate_event
from app.models import Event


def _make_event(db_session, minutes_ago=0, **overrides):
    payload = {
        "source_ip": "203.0.113.9",
        "event_type": "AUTH_FAILURE",
        "severity": "LOW",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=minutes_ago),
    }
    payload.update(overrides)
    event = Event(**payload)
    db_session.add(event)
    db_session.flush()
    return event


def test_no_alert_below_threshold(db_session):
    alerts = []
    for _ in range(5):
        event = _make_event(db_session)
        alerts.extend(evaluate_event(db_session, event))
    assert alerts == []


def test_alert_fires_at_threshold(db_session):
    alerts = []
    for _ in range(10):
        event = _make_event(db_session)
        alerts.extend(evaluate_event(db_session, event))
    assert len(alerts) == 1
    assert alerts[0].rule_id == "RULE-001"
    assert alerts[0].severity == "HIGH"
    assert alerts[0].mitre_technique == "T1110"


def test_alert_does_not_duplicate_within_window(db_session):
    for _ in range(10):
        event = _make_event(db_session)
        evaluate_event(db_session, event)

    # One more event past the threshold within the same window
    extra_event = _make_event(db_session)
    more_alerts = evaluate_event(db_session, extra_event)
    assert more_alerts == []


def test_events_outside_window_do_not_count(db_session):
    alerts = []
    for _ in range(5):
        event = _make_event(db_session, minutes_ago=10)  # outside the 60s window
        alerts.extend(evaluate_event(db_session, event))
    for _ in range(5):
        event = _make_event(db_session, minutes_ago=0)
        alerts.extend(evaluate_event(db_session, event))
    assert alerts == []


def test_different_source_ips_tracked_independently(db_session):
    alerts = []
    for i in range(9):
        event = _make_event(db_session, source_ip="203.0.113.9")
        alerts.extend(evaluate_event(db_session, event))
    for i in range(9):
        event = _make_event(db_session, source_ip="198.51.100.4")
        alerts.extend(evaluate_event(db_session, event))
    assert alerts == []  # neither IP reached the threshold of 10