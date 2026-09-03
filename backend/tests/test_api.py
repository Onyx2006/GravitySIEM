from fastapi.testclient import TestClient

from app.main import app


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_rules_are_seeded():
    with TestClient(app) as client:
        response = client.get("/api/rules")
        assert response.status_code == 200
        rules = response.json()
        rule_ids = {r["id"] for r in rules}
        assert "RULE-001" in rule_ids
        assert len(rules) == 7


def test_simulator_triggers_events():
    with TestClient(app) as client:
        response = client.post("/api/simulator/malware")
        assert response.status_code == 200
        body = response.json()
        assert body["events_queued"] == 1
        assert "simulad" in body["message"].lower()