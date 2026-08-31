"""Detection rule catalog for Gravity SIEM.

Each rule is declarative: it describes *what* pattern of events should
trigger an alert. The actual matching logic lives in `engine.py`, kept
generic (a threshold-within-time-window counter per source_ip) so new
rules can be added here without touching the engine.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class RuleDefinition:
    id: str
    name: str
    description: str
    severity: str
    threshold: int
    time_window: int  # seconds
    event_type: str
    mitre_tactic: str
    mitre_technique: str
    mitre_technique_name: str
    alert_title: str


RULES: list[RuleDefinition] = [
    RuleDefinition(
        id="RULE-001",
        name="SSH Brute Force",
        description=(
            "Detecta 10 o mas fallos de autenticacion SSH (AUTH_FAILURE) "
            "desde la misma IP origen en una ventana de 60 segundos."
        ),
        severity="HIGH",
        threshold=10,
        time_window=60,
        event_type="AUTH_FAILURE",
        mitre_tactic="Credential Access",
        mitre_technique="T1110",
        mitre_technique_name="Brute Force",
        alert_title="SSH Brute Force Attack Detected",
    ),
    RuleDefinition(
        id="RULE-002",
        name="Port Scanning",
        description=(
            "Detecta conexiones a 15 o mas puertos de destino distintos "
            "desde la misma IP origen en 60 segundos."
        ),
        severity="MEDIUM",
        threshold=15,
        time_window=60,
        event_type="PORT_SCAN",
        mitre_tactic="Discovery",
        mitre_technique="T1046",
        mitre_technique_name="Network Service Discovery",
        alert_title="Port Scan Detected",
    ),
    RuleDefinition(
        id="RULE-003",
        name="SQL Injection",
        description=(
            "Detecta 5 o mas peticiones HTTP con patrones de inyeccion SQL "
            "simulados desde la misma IP origen en 120 segundos."
        ),
        severity="CRITICAL",
        threshold=5,
        time_window=120,
        event_type="SQL_INJECTION",
        mitre_tactic="Initial Access",
        mitre_technique="T1190",
        mitre_technique_name="Exploit Public-Facing Application",
        alert_title="SQL Injection Attempt Detected",
    ),
    RuleDefinition(
        id="RULE-004",
        name="Cross-Site Scripting (XSS)",
        description=(
            "Detecta 5 o mas peticiones HTTP con payloads XSS simulados "
            "desde la misma IP origen en 120 segundos."
        ),
        severity="HIGH",
        threshold=5,
        time_window=120,
        event_type="XSS_ATTEMPT",
        mitre_tactic="Initial Access",
        mitre_technique="T1190",
        mitre_technique_name="Exploit Public-Facing Application",
        alert_title="Cross-Site Scripting (XSS) Attempt Detected",
    ),
    RuleDefinition(
        id="RULE-005",
        name="Multiple Failed Logins",
        description=(
            "Detecta 5 o mas fallos de autenticacion en aplicaciones web "
            "(no SSH) desde la misma IP origen en 90 segundos."
        ),
        severity="MEDIUM",
        threshold=5,
        time_window=90,
        event_type="WEB_AUTH_FAILURE",
        mitre_tactic="Credential Access",
        mitre_technique="T1110.001",
        mitre_technique_name="Password Guessing",
        alert_title="Multiple Failed Login Attempts Detected",
    ),
    RuleDefinition(
        id="RULE-006",
        name="Suspicious Malware Detection",
        description=(
            "Se dispara cuando el sensor de endpoint reporta la deteccion "
            "de un archivo o proceso sospechoso."
        ),
        severity="CRITICAL",
        threshold=1,
        time_window=1,
        event_type="MALWARE_DETECTED",
        mitre_tactic="Execution",
        mitre_technique="T1204",
        mitre_technique_name="User Execution",
        alert_title="Malware Detection Alert",
    ),
    RuleDefinition(
        id="RULE-007",
        name="Potential DDoS",
        description=(
            "Detecta un volumen anomalo de 100 o mas eventos de red desde "
            "la misma IP origen en 30 segundos."
        ),
        severity="CRITICAL",
        threshold=100,
        time_window=30,
        event_type="NETWORK_FLOOD",
        mitre_tactic="Impact",
        mitre_technique="T1498",
        mitre_technique_name="Network Denial of Service",
        alert_title="Potential DDoS Activity Detected",
    ),
]

RULES_BY_EVENT_TYPE: dict[str, list[RuleDefinition]] = {}
for _rule in RULES:
    RULES_BY_EVENT_TYPE.setdefault(_rule.event_type, []).append(_rule)