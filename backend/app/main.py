import asyncio
import logging
import random
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import alerts, events, incidents, map_sources, mitre, rules, simulator, stats, ws
from app.seed import run_seed
from app.services.events import generate_benign_event, ingest_event
from app.services.websocket_manager import manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gravity-siem")

_background_task: asyncio.Task | None = None
_broadcaster_task: asyncio.Task | None = None


async def _background_event_generator() -> None:
    """Keeps the live feed alive with a trickle of benign, simulated events."""
    while True:
        await asyncio.sleep(random.uniform(2.0, 5.0))
        db = SessionLocal()
        try:
            payload = generate_benign_event()
            ingest_event(db, payload)
        except Exception:  # pragma: no cover - defensive, keep the loop alive
            logger.exception("Background event generator failed")
        finally:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _background_task, _broadcaster_task

    Base.metadata.create_all(bind=engine)

    if settings.seed_on_start:
        db = SessionLocal()
        try:
            run_seed(db)
        finally:
            db.close()

    manager.bind_loop(asyncio.get_running_loop())
    _broadcaster_task = asyncio.create_task(manager.broadcaster_loop())
    _background_task = asyncio.create_task(_background_event_generator())

    logger.info("Gravity SIEM backend started (SIMULATION MODE)")
    yield

    for task in (_background_task, _broadcaster_task):
        if task:
            task.cancel()


app = FastAPI(
    title="Gravity SIEM API",
    description=(
        "API del mini-SIEM educativo Gravity SIEM. Todos los eventos, IPs y "
        "ataques son SIMULADOS con fines de demostracion y portfolio."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(rules.router)
app.include_router(stats.router)
app.include_router(simulator.router)
app.include_router(mitre.router)
app.include_router(map_sources.router)
app.include_router(ws.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "simulation_mode": True}


@app.get("/")
def root():
    return {
        "name": "Gravity SIEM API",
        "docs": "/docs",
        "simulation_mode": True,
    }