"""
SPARK Smart Parking - FastAPI Application Entry Point

Main application setup with CORS, routers, and startup events.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import auth, parking, iot, recommendation, prediction, user

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager — runs on startup and shutdown."""
    # ── Startup ──
    logger.info("🚀 SPARK Smart Parking Backend starting up...")

    # Validate required settings
    errors = settings.validate()
    if errors:
        for err in errors:
            logger.warning(f"⚠️  Config warning: {err}")
        logger.warning(
            "Backend running with missing config. Some features may not work."
        )
    else:
        logger.info("✅ Configuration validated successfully.")

    # Pre-load YOLOv8 model
    try:
        from app.services.detection_service import detection_service
        detection_service.load_model()
        logger.info("✅ YOLOv8 model loaded successfully.")
    except Exception as e:
        logger.warning(f"⚠️  YOLOv8 model not loaded: {e}")
        logger.warning("IoT detection endpoint will not work until model is available.")

    logger.info(f"✅ CORS origins: {settings.CORS_ORIGINS}")
    logger.info("🅿️  SPARK Backend is ready!")

    yield

    # ── Shutdown ──
    logger.info("👋 SPARK Smart Parking Backend shutting down...")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SPARK Smart Parking API",
    description=(
        "REST API for the SPARK Smart Car Parking System at ITB. "
        "Provides real-time parking availability monitoring, smart recommendations, "
        "and predictive analytics powered by IoT (ESP32-CAM) and AI (YOLOv8)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files for snapshots
# ---------------------------------------------------------------------------

os.makedirs("static/snapshots", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(parking.router, prefix="/parking", tags=["Parking"])
app.include_router(iot.router, prefix="/iot", tags=["IoT"])
app.include_router(recommendation.router, prefix="/recommendation", tags=["Recommendation"])
app.include_router(prediction.router, prefix="/prediction", tags=["Prediction"])
app.include_router(user.router, prefix="/user", tags=["User"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring and deployment probes."""
    return {
        "status": "healthy",
        "service": "SPARK Smart Parking API",
        "version": "1.0.0",
    }
