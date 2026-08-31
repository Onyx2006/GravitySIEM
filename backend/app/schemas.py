import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    timestamp: datetime
    source_ip: str
    destination_ip: str | None
    source_port: int | None
    destination_port: int | None
    protocol: str | None
    event_type: str
    source_system: str
    username: str | None
    hostname: str | None
    message: str | None
    severity: str
    event_metadata: dict
    created_at: datetime


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    event_id: uuid.UUID | None
    rule_id: str
    incident_id: uuid.UUID | None
    title: str
    description: str
    severity: str
    confidence: int
    source_ip: str
    mitre_tactic: str
    mitre_technique: str
    status: str
    created_at: datetime


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    severity: str
    status: str
    source_ip: str
    mitre_technique: str
    first_seen: datetime
    last_seen: datetime
    event_count: int
    alert_count: int
    created_at: datetime
    updated_at: datetime


class IncidentTimelineItem(BaseModel):
    timestamp: datetime
    label: str
    kind: str  # "event" | "alert" | "status"


class IncidentDetailOut(IncidentOut):
    timeline: list[IncidentTimelineItem]
    alerts: list[AlertOut]


class IncidentUpdate(BaseModel):
    status: str


class DetectionRuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    severity: str
    threshold: int
    time_window: int
    event_type: str
    mitre_tactic: str
    mitre_technique: str
    mitre_technique_name: str
    enabled: bool


class DetectionRuleUpdate(BaseModel):
    enabled: bool


class StatsOut(BaseModel):
    total_events: int
    active_alerts: int
    critical_alerts: int
    open_incidents: int
    events_per_minute: float
    severity_breakdown: dict[str, int]
    event_type_breakdown: dict[str, int]
    top_sources: list[dict]
    threat_activity: list[dict]


class MitreTechniqueOut(BaseModel):
    technique_id: str
    name: str
    tactic: str
    alert_count: int


class SimulatorResponse(BaseModel):
    attack: str
    events_queued: int
    message: str