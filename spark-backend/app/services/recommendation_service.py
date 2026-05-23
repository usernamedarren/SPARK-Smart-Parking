"""
SPARK Smart Parking - Recommendation Service

Smart routing algorithm that recommends parking areas based on
proximity to destination building and slot availability.
"""

import logging
import math
from typing import Optional

from app.config import settings
from app.services.parking_service import parking_service

logger = logging.getLogger(__name__)

WALKING_SPEED_KMH = 5.0
WEIGHT_DISTANCE = 0.4
WEIGHT_AVAILABILITY = 0.6


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate great-circle distance between two GPS coordinates in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def resolve_destination(destination: str) -> Optional[tuple[float, float]]:
    """Resolve a building name to GPS coordinates via fuzzy matching."""
    dest_lower = destination.lower().strip()
    if dest_lower in settings.BUILDING_COORDINATES:
        return settings.BUILDING_COORDINATES[dest_lower]
    for name, coords in settings.BUILDING_COORDINATES.items():
        if dest_lower in name or name in dest_lower:
            return coords
    return None


class RecommendationService:
    async def get_recommendations(self, destination: str, top_n: int = 5) -> dict:
        coords = resolve_destination(destination)
        if coords is None:
            logger.warning(f"Destination '{destination}' not found, using campus center.")
            coords = (-6.8915, 107.6105)
        dest_lat, dest_lon = coords

        areas_with_status = await parking_service.get_all_status()
        recommendations = []
        for area in areas_with_status:
            available = area.get("available_slots", 0)
            total = area.get("total_slots", 1)
            if total == 0:
                continue
            distance_km = haversine_distance(area["latitude"], area["longitude"], dest_lat, dest_lon)
            distance_score = 1.0 / (1.0 + distance_km * 100)
            availability_score = available / total
            score = WEIGHT_DISTANCE * distance_score + WEIGHT_AVAILABILITY * availability_score
            walk_minutes = (distance_km / WALKING_SPEED_KMH) * 60
            recommendations.append({
                "area_id": area["id"], "area_name": area["name"],
                "available_slots": available, "total_slots": total,
                "occupancy_rate": area.get("occupancy_rate", 0.0),
                "status_label": area.get("status_label", "available"),
                "distance_km": round(distance_km, 4),
                "estimated_walk_minutes": round(walk_minutes, 1),
                "score": round(score, 4),
            })
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return {"destination": destination, "recommendations": recommendations[:top_n]}


recommendation_service = RecommendationService()
