from fastapi import APIRouter

from app.database import SessionLocal
from app.schemas import SimulatorResponse
from app.services import simulator

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

_ATTACKS = {
    "brute-force": (simulator.run_ssh_brute_force, "SSH Brute Force"),
    "port-scan": (simulator.run_port_scan, "Port Scan"),
    "sql-injection": (simulator.run_sql_injection, "SQL Injection"),
    "xss": (simulator.run_xss, "Cross-Site Scripting"),
    "suspicious-login": (simulator.run_suspicious_login, "Suspicious Login"),
    "malware": (simulator.run_malware_detection, "Malware Detection"),
    "ddos": (simulator.run_ddos, "DDoS"),
}


def _make_endpoint(key: str, func, label: str):
    async def endpoint() -> SimulatorResponse:
        count = await func(SessionLocal)
        return SimulatorResponse(
            attack=label,
            events_queued=count,
            message=(
                f"Simulacion '{label}' iniciada: {count} eventos simulados se "
                "generaran progresivamente. Ningun trafico real ha sido enviado."
            ),
        )

    endpoint.__name__ = f"simulate_{key.replace('-', '_')}"
    return endpoint


for _key, (_func, _label) in _ATTACKS.items():
    router.add_api_route(
        f"/{_key}",
        _make_endpoint(_key, _func, _label),
        methods=["POST"],
        response_model=SimulatorResponse,
        summary=f"Simulate {_label}",
    )