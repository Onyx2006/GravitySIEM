# 08 — Despliegue

## Local con Docker Compose
```mermaid
flowchart LR
    subgraph Docker["docker compose up --build"]
        FE[frontend<br/>:5173]
        BE[backend<br/>:8000]
        DB[(postgres<br/>:5432)]
    end
    FE -->|VITE_API_URL| BE
    FE -->|VITE_WS_URL| BE
    BE -->|DATABASE_URL| DB
```

```bash
docker compose up --build
```

`docker-compose.yml` define tres servicios:

| Servicio | Imagen base | Puerto | Healthcheck |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | `pg_isready` |
| `backend` | `python:3.12-slim` (Dockerfile propio) | 8000 | `GET /api/health` |
| `frontend` | `node:20-alpine` (Dockerfile propio) | 5173 | — (depende de `backend`) |

`backend` espera a que `postgres` esté `healthy` (`depends_on:
condition: service_healthy`) antes de arrancar, evitando errores de
conexión en el primer arranque.

## Variables de entorno
### Backend
| Variable | Default | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://gravity:gravity_dev_password@postgres:5432/gravity_siem` | cadena de conexión SQLAlchemy |
| `CORS_ORIGINS` | `http://localhost:5173` | orígenes permitidos, separados por coma |
| `SEED_ON_START` | `true` | si `false`, no siembra reglas ni histórico |

### Frontend
| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | base de todas las llamadas REST |
| `VITE_WS_URL` | `ws://localhost:8000` | base del WebSocket |
| `VITE_DEMO_MODE` | `false` | reservado para modo sin backend (roadmap) |

Copia `.env.example` a `.env` en `frontend/` si prefieres no usar las
variables definidas en `docker-compose.yml`.

## Persistencia
Los datos de PostgreSQL viven en el volumen nombrado
`gravity_pgdata`, así que sobreviven a `docker compose down` (pero no
a `docker compose down -v`). Para reiniciar completamente el estado:

```bash
docker compose down -v
docker compose up --build
```

## Preparación para GitHub Pages
El frontend está desacoplado a propósito: **ninguna página** hace
`fetch("http://localhost:8000/...")` directamente, todo pasa por
`src/api.ts` y `src/ws.ts`, que leen `VITE_API_URL`/`VITE_WS_URL` en
tiempo de build (Vite las inyecta como constantes).

```mermaid
flowchart LR
    subgraph Hoy["Configuración actual"]
        FE1[Frontend :5173] --> BE1[Backend :8000 local]
    end
    subgraph Futuro["Futuro: GitHub Pages"]
        FE2[Frontend estático<br/>en GitHub Pages] -->|VITE_API_URL apuntando a backend externo| BE2[Backend desplegado<br/>Railway / Fly.io / VPS]
    end
```

Pasos para el despliegue futuro (no implementados todavía, ver
Roadmap en el README):
1. Desplegar el backend en cualquier proveedor con soporte Docker
   (Railway, Fly.io, Render, un VPS propio) y anotar su URL pública.
2. Compilar el frontend con `VITE_API_URL`/`VITE_WS_URL` apuntando a
   esa URL: `npm run build` genera `frontend/dist/`.
3. Publicar `frontend/dist/` en GitHub Pages (rama `gh-pages` o
   GitHub Actions).
4. Configurar `CORS_ORIGINS` en el backend para incluir el dominio de
   GitHub Pages.
5. (Opcional, roadmap) Activar `VITE_DEMO_MODE=true` para una versión
   que funcione con datos estáticos si el backend no está disponible.

## Logs y depuración
```bash
docker compose logs -f backend     # logs del motor de detección / ingesta
docker compose logs -f frontend    # logs de Vite dev server
docker compose exec postgres psql -U gravity -d gravity_siem   # acceso directo a la BD
```