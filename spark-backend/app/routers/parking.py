"""
SPARK Smart Parking - Parking Router

Endpoints for parking status, areas, and history.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import ParkingAreaWithStatus, ParkingHistory
from app.services.parking_service import parking_service
from app.dependencies import get_current_user, get_optional_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/areas", response_model=list[dict])
async def get_parking_areas():
    """Get all parking area info (without status)."""
    return await parking_service.get_all_areas()


@router.get("/status", response_model=list[ParkingAreaWithStatus])
async def get_all_parking_status():
    """Get all parking areas with their current availability status."""
    return await parking_service.get_all_status()


@router.get("/status/{area_id}", response_model=ParkingAreaWithStatus)
async def get_parking_area_status(area_id: str):
    """Get the current status of a specific parking area."""
    result = await parking_service.get_area_status(area_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Parking area '{area_id}' not found.")
    return result


@router.get("/history/{area_id}", response_model=list[ParkingHistory])
async def get_parking_history(
    area_id: str,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    start_date: Optional[str] = Query(default=None, description="ISO 8601 start date"),
    end_date: Optional[str] = Query(default=None, description="ISO 8601 end date"),
    current_user: dict = Depends(get_current_user),
):
    """Get historical parking data for a specific area (requires auth)."""
    # Verify area exists
    area = await parking_service.get_area_by_id(area_id)
    if area is None:
        raise HTTPException(status_code=404, detail=f"Parking area '{area_id}' not found.")

    if start_date and end_date:
        return await parking_service.get_history_by_date_range(area_id, start_date, end_date)
    return await parking_service.get_history(area_id, limit=limit, offset=offset)
