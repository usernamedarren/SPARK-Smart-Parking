"""
SPARK Smart Parking - Recommendation Router

Endpoint for getting smart parking recommendations based on destination.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import RecommendationResponse
from app.services.recommendation_service import recommendation_service
from app.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=RecommendationResponse)
async def get_recommendation(
    destination: str = Query(..., description="Target building name (e.g., 'GKU Barat')"),
    top_n: int = Query(default=5, ge=1, le=20, description="Number of recommendations"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get parking area recommendations for a selected building.

    The algorithm prioritizes parking areas with available slots, then sorts
    them by the shortest distance to the chosen building.
    """
    try:
        result = await recommendation_service.get_recommendations(destination, top_n)
        return result
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations.")
