"""
SPARK Smart Parking - Prediction Service

Predicts parking availability at a future time using historical data patterns.
"""

import logging
from datetime import datetime
from app.dependencies import get_supabase_admin
from app.models.enums import StatusLabel

logger = logging.getLogger(__name__)


class PredictionService:
    async def predict_availability(self, area_id: str, arrival_time: datetime) -> dict:
        """
        Predict parking availability at a future time using historical averages.
        
        Algorithm:
        1. Query parking_history for same day-of-week and hour window (±1 hour)
        2. Calculate average occupancy rate from historical data
        3. Return predicted available slots with confidence based on sample size
        """
        admin = get_supabase_admin()

        # Get area info
        area_result = admin.table("parking_areas").select("*").eq("id", area_id).maybe_single().execute()
        area = area_result.data
        if area is None:
            raise ValueError(f"Parking area '{area_id}' not found.")

        total_slots = area.get("total_slots", 0)
        target_dow = arrival_time.weekday()  # 0=Monday
        target_hour = arrival_time.hour

        # Fetch all history for this area
        history_result = (
            admin.table("parking_history")
            .select("occupancy_rate, recorded_at")
            .eq("parking_area_id", area_id)
            .order("recorded_at", desc=True)
            .limit(1000)
            .execute()
        )
        records = history_result.data or []

        # Filter by matching day-of-week and hour window
        matching = []
        for r in records:
            try:
                rec_time = datetime.fromisoformat(r["recorded_at"].replace("Z", "+00:00"))
                if rec_time.weekday() == target_dow and abs(rec_time.hour - target_hour) <= 1:
                    matching.append(r["occupancy_rate"])
            except (ValueError, KeyError):
                continue

        # Calculate prediction
        if matching:
            avg_rate = sum(matching) / len(matching)
            confidence = min(len(matching) / 20.0, 1.0)  # 20+ samples = full confidence
        else:
            # Fallback: get current status or use 50% default
            status_result = (
                admin.table("parking_status")
                .select("occupancy_rate")
                .eq("parking_area_id", area_id)
                .maybe_single()
                .execute()
            )
            avg_rate = status_result.data.get("occupancy_rate", 0.5) if status_result.data else 0.5
            confidence = 0.2  # Low confidence with no historical data

        predicted_available = max(0, int(total_slots * (1 - avg_rate)))
        predicted_rate = round(avg_rate, 4)

        if predicted_rate < 0.6:
            label = StatusLabel.AVAILABLE.value
        elif predicted_rate < 0.85:
            label = StatusLabel.LIMITED.value
        else:
            label = StatusLabel.FULL.value

        # Get current available slots
        current_status = (
            admin.table("parking_status")
            .select("available_slots")
            .eq("parking_area_id", area_id)
            .maybe_single()
            .execute()
        )
        current_available = current_status.data.get("available_slots", total_slots) if current_status.data else total_slots

        return {
            "area_id": area_id,
            "area_name": area["name"],
            "arrival_time": arrival_time.isoformat(),
            "current_available_slots": current_available,
            "predicted_available_slots": predicted_available,
            "predicted_occupancy_rate": predicted_rate,
            "predicted_status_label": label,
            "confidence": round(confidence, 2),
            "sample_size": len(matching),
        }


prediction_service = PredictionService()
