"""WebSocket broadcast manager.

Alert/event creation can happen from a plain synchronous request
handler (attack simulator endpoints) or from the async background
generator loop. To keep broadcasting simple and thread-safe, producers
just push serialized dicts onto an asyncio.Queue; a single consumer
task drains the queue and fans messages out to all connected clients.
"""

import asyncio
import json
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from fastapi import WebSocket


def _json_default(obj):
    if isinstance(obj, (UUID,)):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []
        self.queue: asyncio.Queue = asyncio.Queue()
        self._loop: asyncio.AbstractEventLoop | None = None

    def bind_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    def _enqueue(self, message_type: str, data) -> None:
        payload = json.dumps({"type": message_type, "data": data}, default=_json_default)
        if self._loop is None:
            return
        self._loop.call_soon_threadsafe(self.queue.put_nowait, payload)

    def enqueue_event(self, event) -> None:
        self._enqueue("event", _event_to_dict(event))

    def enqueue_alert(self, alert) -> None:
        self._enqueue("alert", _alert_to_dict(alert))

    def enqueue_incident(self, incident) -> None:
        self._enqueue("incident", _incident_to_dict(incident))

    async def broadcaster_loop(self) -> None:
        while True:
            message = await self.queue.get()
            dead: list[WebSocket] = []
            for connection in self.active_connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    dead.append(connection)
            for connection in dead:
                self.disconnect(connection)


def _event_to_dict(event) -> dict:
    return {
        "id": str(event.id),
        "timestamp": event.timestamp,
        "source_ip": event.source_ip,
        "destination_ip": event.destination_ip,
        "destination_port": event.destination_port,
        "protocol": event.protocol,
        "event_type": event.event_type,
        "source_system": event.source_system,
        "username": event.username,
        "hostname": event.hostname,
        "message": event.message,
        "severity": event.severity,
    }


def _alert_to_dict(alert) -> dict:
    return {
        "id": str(alert.id),
        "event_id": str(alert.event_id) if alert.event_id else None,
        "rule_id": alert.rule_id,
        "incident_id": str(alert.incident_id) if alert.incident_id else None,
        "title": alert.title,
        "description": alert.description,
        "severity": alert.severity,
        "confidence": alert.confidence,
        "source_ip": alert.source_ip,
        "mitre_tactic": alert.mitre_tactic,
        "mitre_technique": alert.mitre_technique,
        "status": alert.status,
        "created_at": alert.created_at,
    }


def _incident_to_dict(incident) -> dict:
    return {
        "id": str(incident.id),
        "title": incident.title,
        "severity": incident.severity,
        "status": incident.status,
        "source_ip": incident.source_ip,
        "mitre_technique": incident.mitre_technique,
        "first_seen": incident.first_seen,
        "last_seen": incident.last_seen,
        "event_count": incident.event_count,
        "alert_count": incident.alert_count,
    }

manager = ConnectionManager()