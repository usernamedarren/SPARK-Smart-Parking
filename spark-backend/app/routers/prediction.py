"""
SPARK Smart Parking - Prediction Router

Endpoint for predicting parking availability at a future time.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.schemas import PredictionResponse
from app.services.prediction_service import prediction_service
from app.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=PredictionResponse)
async def get_prediction(
    area_id: str = Query(..., description="Parking area UUID"),
    arrival_time: datetime = Query(..., description="Estimated arrival time (ISO 8601)"),
    current_user: dict = Depends(get_current_user),
):
    """
    Predict parking availability at a specific future time.

    Uses historical occupancy patterns (same day-of-week and hour) to estimate
    how many slots will be available when the user arrives.
    """
    try:
        result = await prediction_service.predict_availability(area_id, arrival_time)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate prediction.")
