"""
SPARK Smart Parking - Parking Service

CRUD operations for parking areas, status, and history.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from app.dependencies import get_supabase_admin
from app.models.enums import StatusLabel

logger = logging.getLogger(__name__)


class ParkingService:
    """Service for managing parking status data."""

    def _get_admin(self):
        return get_supabase_admin()

    # ------------------------------------------------------------------
    # Parking Areas
    # ------------------------------------------------------------------

    async def get_all_areas(self) -> list[dict]:
        """Get all parking areas."""
        admin = self._get_admin()
        result = (
            admin.table("parking_areas")
            .select("*")
            .order("name")
            .execute()
        )
        return result.data or []

    async def get_area_by_camera(self, camera_device_id: str) -> Optional[dict]:
        """Find a parking area by its camera device ID."""
        admin = self._get_admin()
        result = (
            admin.table("parking_areas")
            .select("*")
            .eq("camera_device_id", camera_device_id)
            .maybe_single()
            .execute()
        )
        return result.data

    async def get_area_by_id(self, area_id: str) -> Optional[dict]:
        """Get a parking area by ID."""
        admin = self._get_admin()
        result = (
            admin.table("parking_areas")
            .select("*")
            .eq("id", area_id)
            .maybe_single()
            .execute()
        )
        return result.data

    # ------------------------------------------------------------------
    # Parking Status
    # ------------------------------------------------------------------

    async def get_all_status(self) -> list[dict]:
        """
        Get all parking areas with their current status.

        Joins parking_areas with parking_status to return combined data.
        """
        admin = self._get_admin()

        # Fetch areas
        areas_result = (
            admin.table("parking_areas")
            .select("*")
            .order("name")
            .execute()
        )
        areas = areas_result.data or []

        # Fetch all statuses
        status_result = (
            admin.table("parking_status")
            .select("*")
            .execute()
        )
        statuses = {s["parking_area_id"]: s for s in (status_result.data or [])}

        # Combine
        combined = []
        for area in areas:
            area_status = statuses.get(area["id"], {})
            camera_id = area.get("camera_device_id")
            image_url = f"/static/snapshots/{camera_id}.jpg" if camera_id else None
            combined.append({
                **area,
                "occupied_slots": area_status.get("occupied_slots", 0),
                "available_slots": area_status.get(
                    "available_slots", area.get("total_slots", 0)
                ),
                "occupancy_rate": area_status.get("occupancy_rate", 0.0),
                "status_label": area_status.get("status_label", StatusLabel.AVAILABLE.value),
                "captured_at": area_status.get("captured_at"),
                "updated_at": area_status.get("updated_at"),
                "image_url": image_url,
            })

        return combined

    async def get_area_status(self, area_id: str) -> Optional[dict]:
        """Get a single parking area with its current status."""
        admin = self._get_admin()

        # Fetch area
        area_result = (
            admin.table("parking_areas")
            .select("*")
            .eq("id", area_id)
            .maybe_single()
            .execute()
        )
        area = area_result.data
        if area is None:
            return None

        # Fetch status
        status_result = (
            admin.table("parking_status")
            .select("*")
            .eq("parking_area_id", area_id)
            .maybe_single()
            .execute()
        )
        area_status = status_result.data or {}

        camera_id = area.get("camera_device_id")
        image_url = f"/static/snapshots/{camera_id}.jpg" if camera_id else None

        return {
            **area,
            "occupied_slots": area_status.get("occupied_slots", 0),
            "available_slots": area_status.get(
                "available_slots", area.get("total_slots", 0)
            ),
            "occupancy_rate": area_status.get("occupancy_rate", 0.0),
            "status_label": area_status.get("status_label", StatusLabel.AVAILABLE.value),
            "captured_at": area_status.get("captured_at"),
            "updated_at": area_status.get("updated_at"),
            "image_url": image_url,
        }

    async def update_status(
        self,
        parking_area_id: str,
        occupied_slots: int,
        available_slots: int,
        occupancy_rate: float,
        status_label: str,
    ) -> dict:
        """
        Upsert the current parking status for an area.

        Uses upsert on parking_area_id to ensure only one status record per area.
        """
        admin = self._get_admin()
        now = datetime.now(timezone.utc).isoformat()

        data = {
            "parking_area_id": parking_area_id,
            "occupied_slots": occupied_slots,
            "available_slots": available_slots,
            "occupancy_rate": occupancy_rate,
            "status_label": status_label,
            "captured_at": now,
            "updated_at": now,
        }

        result = (
            admin.table("parking_status")
            .upsert(data, on_conflict="parking_area_id")
            .execute()
        )

        logger.info(
            f"Updated status for area {parking_area_id}: "
            f"{occupied_slots}/{occupied_slots + available_slots} occupied "
            f"({status_label})"
        )

        return result.data[0] if result.data else data

    # ------------------------------------------------------------------
    # Parking History
    # ------------------------------------------------------------------

    async def add_history_record(
        self,
        parking_area_id: str,
        occupied_slots: int,
        available_slots: int,
        occupancy_rate: float,
    ) -> dict:
        """Insert a new historical record for parking occupancy."""
        admin = self._get_admin()

        data = {
            "parking_area_id": parking_area_id,
            "occupied_slots": occupied_slots,
            "available_slots": available_slots,
            "occupancy_rate": occupancy_rate,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }

        result = admin.table("parking_history").insert(data).execute()
        return result.data[0] if result.data else data

    async def get_history(
        self,
        area_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict]:
        """Get paginated historical records for a parking area."""
        admin = self._get_admin()
        result = (
            admin.table("parking_history")
            .select("*")
            .eq("parking_area_id", area_id)
            .order("recorded_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return result.data or []

    async def get_history_by_date_range(
        self,
        area_id: str,
        start_date: str,
        end_date: str,
    ) -> list[dict]:
        """Get historical records within a date range."""
        admin = self._get_admin()
        result = (
            admin.table("parking_history")
            .select("*")
            .eq("parking_area_id", area_id)
            .gte("recorded_at", start_date)
            .lte("recorded_at", end_date)
            .order("recorded_at", desc=True)
            .execute()
        )
        return result.data or []


parking_service = ParkingService()
