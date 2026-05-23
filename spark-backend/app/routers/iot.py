"""
SPARK Smart Parking - IoT Router

Endpoint for receiving ESP32-CAM images and running YOLOv8 detection.
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import DetectionResult
from app.services.detection_service import detection_service
from app.services.parking_service import parking_service
from app.utils.image_processing import decode_image, resize_for_inference

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload", response_model=DetectionResult)
async def upload_image(
    image: UploadFile = File(..., description="JPEG image from ESP32-CAM"),
    camera_device_id: str = Form(..., description="Camera device identifier"),
):
    """
    Receive an image from ESP32-CAM, run vehicle detection, and update parking status.

    Flow:
    1. Validate image and camera_device_id
    2. Lookup parking area by camera_device_id
    3. Run YOLOv8 inference
    4. Calculate occupancy
    5. Update parking_status (upsert)
    6. Add parking_history record
    7. Return detection result
    """
    # Validate file type
    if image.content_type and image.content_type not in ("image/jpeg", "image/png", "image/jpg"):
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images are accepted.")

    # Read image bytes
    file_bytes = await image.read()
    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Maximum 10MB.")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file.")

    # Lookup parking area
    area = await parking_service.get_area_by_camera(camera_device_id)
    if area is None:
        raise HTTPException(
            status_code=404,
            detail=f"No parking area found for camera '{camera_device_id}'.",
        )

    total_slots = area.get("total_slots", 0)

    try:
        # Decode and resize image
        img = decode_image(file_bytes)
        img = resize_for_inference(img)

        # Run YOLOv8 detection
        detections = detection_service.detect_vehicles(img)
        occupied, available, rate, label = detection_service.count_occupied_slots(detections, total_slots)
        avg_confidence = detection_service.get_average_confidence(detections)

        # Update current status
        await parking_service.update_status(
            parking_area_id=area["id"],
            occupied_slots=occupied,
            available_slots=available,
            occupancy_rate=rate,
            status_label=label,
        )

        # Add history record
        await parking_service.add_history_record(
            parking_area_id=area["id"],
            occupied_slots=occupied,
            available_slots=available,
            occupancy_rate=rate,
        )

        # Save snapshot to disk (Local Storage)
        snapshot_path = f"static/snapshots/{camera_device_id}.jpg"
        try:
            with open(snapshot_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            logger.error(f"Failed to save snapshot to disk: {e}")

        image_url = f"/static/snapshots/{camera_device_id}.jpg"

        now = datetime.now(timezone.utc)
        return DetectionResult(
            parking_area_id=area["id"],
            parking_area_name=area["name"],
            total_slots=total_slots,
            occupied_slots=occupied,
            available_slots=available,
            occupancy_rate=rate,
            status_label=label,
            vehicles_detected=len(detections),
            confidence_avg=avg_confidence,
            captured_at=now,
            image_url=image_url,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail="Image processing failed.")
