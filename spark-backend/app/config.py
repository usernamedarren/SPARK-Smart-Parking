"""
SPARK Smart Parking - Application Configuration

Centralized configuration management using environment variables.
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # YOLOv8
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "yolov8n.pt")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # CORS
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:8081,http://localhost:19006",
        ).split(",")
    ]

    # ITB Building Coordinates for Recommendation Engine
    # Format: {building_name: (latitude, longitude)}
    BUILDING_COORDINATES: dict[str, tuple[float, float]] = {
        # ITB Ganesha Campus Buildings
        "gku barat": (-6.8915, 107.6107),
        "gku timur": (-6.8915, 107.6115),
        "labtek v": (-6.8908, 107.6102),
        "labtek vi": (-6.8905, 107.6108),
        "labtek viii": (-6.8900, 107.6105),
        "labtek ix": (-6.8898, 107.6100),
        "comlabs": (-6.8912, 107.6098),
        "tvst": (-6.8920, 107.6095),
        "cad": (-6.8918, 107.6090),
        "src": (-6.8925, 107.6100),
        "cc barat": (-6.8922, 107.6095),
        "cc timur": (-6.8922, 107.6102),
        "oktagon": (-6.8910, 107.6095),
        "aula barat": (-6.8928, 107.6105),
        "aula timur": (-6.8928, 107.6112),
        "perpustakaan": (-6.8912, 107.6110),
        "gedung rektorat": (-6.8930, 107.6110),
        "labtek i": (-6.8920, 107.6112),
        "labtek ii": (-6.8918, 107.6115),
        "labtek iii": (-6.8916, 107.6118),
        "labtek iv": (-6.8914, 107.6120),
        "labtek vii": (-6.8902, 107.6110),
        "labtek x": (-6.8895, 107.6108),
    }

    def validate(self) -> list[str]:
        """Validate required settings and return list of missing ones."""
        errors = []
        if not self.SUPABASE_URL:
            errors.append("SUPABASE_URL is required")
        if not self.SUPABASE_KEY:
            errors.append("SUPABASE_KEY is required")
        if not self.SUPABASE_SERVICE_KEY:
            errors.append("SUPABASE_SERVICE_KEY is required")
        return errors


settings = Settings()
