"""
SPARK Smart Parking - Recommendation Service

Parking recommendations ranked by availability first and then by
distance to the selected building.
"""

import logging
import math
from typing import Optional

from app.dependencies import get_supabase_admin
from app.config import settings
from app.services.parking_service import parking_service

logger = logging.getLogger(__name__)

WALKING_SPEED_KMH = 5.0


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
    async def _resolve_building(self, destination: str) -> Optional[dict]:
        """Resolve a selected building from the database or local coordinates."""
        dest_lower = destination.lower().strip()
        admin = get_supabase_admin()

        try:
            result = (
                admin.table("buildings")
                .select("id, name, latitude, longitude")
                .execute()
            )
            buildings = result.data or []
            for building in buildings:
                if building.get("name", "").strip().lower() == dest_lower:
                    return building

            for building in buildings:
                name = building.get("name", "").strip().lower()
                if dest_lower in name or name in dest_lower:
                    return building
        except Exception as exc:
            logger.warning(f"Building lookup failed, falling back to config coordinates: {exc}")

        coords = resolve_destination(destination)
        if coords is None:
            return None

        return {
            "id": None,
            "name": destination.strip(),
            "latitude": coords[0],
            "longitude": coords[1],
        }

    async def get_recommendations(self, destination: str, top_n: int = 5) -> dict:
        building = await self._resolve_building(destination)
        if building is None:
            logger.warning(f"Destination '{destination}' not found, using campus center.")
            building = {
                "id": None,
                "name": destination,
                "latitude": -6.8915,
                "longitude": 107.6105,
            }

        dest_lat = float(building["latitude"])
        dest_lon = float(building["longitude"])

        areas_with_status = await parking_service.get_all_status()
        admin = get_supabase_admin()
        distance_map: dict[str, dict] = {}

        if building.get("id"):
            try:
                distance_result = (
                    admin.table("building_parking_distance")
                    .select("parking_area_id, distance_meters, walking_minutes")
                    .eq("building_id", building["id"])
                    .execute()
                )
                distance_map = {
                    row["parking_area_id"]: row
                    for row in (distance_result.data or [])
                    if row.get("parking_area_id")
                }
            except Exception as exc:
                logger.warning(f"Distance lookup failed, falling back to coordinates: {exc}")

        recommendations = []
        for area in areas_with_status:
            available = area.get("available_slots", 0)
            total = area.get("total_slots", 1)
            if total == 0:
                continue

            distance_row = distance_map.get(area["id"])
            if distance_row is not None:
                distance_meters = float(distance_row.get("distance_meters", 0) or 0)
                walk_minutes = float(
                    distance_row.get("walking_minutes")
                    or (distance_meters / 1000.0 / WALKING_SPEED_KMH) * 60
                )
                distance_km = distance_meters / 1000.0
            else:
                distance_km = haversine_distance(
                    area["latitude"], area["longitude"], dest_lat, dest_lon
                )
                walk_minutes = (distance_km / WALKING_SPEED_KMH) * 60

            score = 1.0 / (1.0 + distance_km)
            recommendations.append({
                "area_id": area["id"], "area_name": area["name"],
                "available_slots": available, "total_slots": total,
                "occupancy_rate": area.get("occupancy_rate", 0.0),
                "status_label": area.get("status_label", "available"),
                "distance_km": round(distance_km, 4),
                "estimated_walk_minutes": round(walk_minutes, 1),
                "score": round(score, 4),
            })

        ranked = sorted(
            recommendations,
            key=lambda item: (
                0 if item["available_slots"] > 0 else 1,
                item["distance_km"],
                item["area_name"],
            ),
        )

        return {
            "destination": building.get("name", destination),
            "recommendations": ranked[:top_n],
        }


recommendation_service = RecommendationService()
