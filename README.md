# GRAVITY SIEM
Un mini-SIEM educativo y funcional que simula el funcionamiento de un
pequeño Security Operations Center (SOC): ingesta de eventos, motor de
reglas de detección, generación de alertas, correlación de incidentes
y un dashboard en tiempo real — todo ejecutable en local con Docker
Compose.

> **SIMULATION MODE**: todos los eventos, IPs, ubicaciones y ataques de
> este proyecto son completamente ficticios y con fines educativos/de
> portfolio. Ver [Security Disclaimer](#security-disclaimer).

**La documentación técnica completa (arquitectura, base de datos,
motor de detección, correlación, API, frontend, despliegue, tests,
MITRE ATT&CK — con diagramas Mermaid) vive en [`/docs`](./docs/README.md).**
Este README es solo la guía rápida de arranque.


## Qué es Gravity SIEM
1. Se generan y/o simulan eventos de seguridad (logs de SSH, firewall,
   servidor web, base de datos, etc.).
2. Cada evento se normaliza y se guarda en PostgreSQL.
3. Un motor de reglas evalúa el evento contra umbrales configurables.
4. Al superar un umbral se crea una **alerta**, mapeada a **MITRE
   ATT&CK**.
5. Las alertas relacionadas se agrupan en un **incidente**.
6. Todo se transmite en tiempo real al frontend vía WebSocket.

Un panel de **Attack Simulator** permite disparar ataques simulados
(fuerza bruta SSH, port scan, SQL injection, XSS, logins sospechosos,
detección de malware, DDoS) y observar en vivo cómo el sistema los
detecta y correlaciona. Detalle completo en
[docs/05-attack-simulator.md](./docs/05-attack-simulator.md).

## Stack
| Capa | Tecnología |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet, Lucide |
| Backend | Python, FastAPI, Pydantic, WebSockets |
| Base de datos | PostgreSQL (JSONB) |
| Infra | Docker, Docker Compose |

Sin servicios cloud de pago; todo corre en local.

## Cómo ejecutarlo
```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 (`gravity_siem`) |

Al primer arranque, el backend crea las tablas, siembra las 7 reglas
de detección y ~90 minutos de eventos históricos simulados (para que
el dashboard no aparezca vacío), y arranca un generador de eventos
benignos en segundo plano.

## Estructura del proyecto
```
gravity-siem/
├── docs/                # documentación técnica completa (ver docs/README.md)
├── docker-compose.yml
├── backend/
│   ├── app/
│   │   ├── main.py, config.py, database.py, models.py, schemas.py, seed.py
│   │   ├── detection/    # rules.py + engine.py
│   │   ├── services/     # events, incidents, simulator, geo, websocket_manager
│   │   └── routers/      # events, alerts, incidents, rules, stats, simulator, mitre, ws
│   └── tests/
└── frontend/
    └── src/
        ├── api.ts, ws.ts, liveStore.tsx, types.ts, App.tsx
        ├── components/
        └── pages/
```

## Tests
```bash
cd backend && pytest -v
```

Detalle de cobertura en [docs/09-testing.md](./docs/09-testing.md).

## Roadmap
Ver la sección final de [docs/08-deployment.md](./docs/08-deployment.md)
y las notas de limitaciones conocidas en
[docs/04-incident-correlation.md](./docs/04-incident-correlation.md).
Resumen: modo demo sin backend (`VITE_DEMO_MODE`), autenticación
básica, exportación de incidentes, reglas de correlación adicionales,
tests de componentes React y E2E.

## Security Disclaimer
Gravity SIEM es un proyecto **educativo y de portfolio**. Todos los
eventos, direcciones IP, nombres de host, usuarios, ubicaciones
geográficas y ataques que genera son **completamente simulados y
ficticios**. El "Attack Simulator" únicamente escribe filas sintéticas
en la base de datos local; en ningún momento se envía tráfico de red
real, se ejecutan exploits, ni se ataca ningún sistema externo. No usar
este proyecto para actividades no autorizadas contra sistemas reales.