"""
SPARK Smart Parking - IoT Router

Endpoint for receiving ESP32-CAM images and running YOLOv8 detection.
"""

import logging
import traceback
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
    # Validate file type — allow octet-stream since Arduino HTTPClient sends this for binary payloads
    ALLOWED_TYPES = ("image/jpeg", "image/png", "image/jpg", "application/octet-stream")
    if image.content_type and image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type '{image.content_type}'. Expected image/jpeg or image/png.",
        )

    # Read image bytes
    file_bytes = await image.read()
    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Maximum 10MB.")
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file.")

    # Lookup parking area
    try:
        area = await parking_service.get_area_by_camera(camera_device_id)
    except Exception as e:
        logger.error(f"DB lookup failed for camera '{camera_device_id}': {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Try again later.")

    if area is None:
        # Fetch valid IDs to help the developer debug
        try:
            all_areas = await parking_service.get_all_areas()
            valid_ids = [a["camera_device_id"] for a in all_areas if a.get("camera_device_id")]
            hint = f" Valid IDs: {valid_ids}" if valid_ids else ""
        except Exception:
            hint = ""
        raise HTTPException(
            status_code=404,
            detail=f"No parking area found for camera_device_id='{camera_device_id}'.{hint}",
        )

    total_slots = area.get("total_slots", 0)

    try:
        if camera_device_id == "CAM-TEST":
            # Run custom YOLOv8-segmentation based slot prediction
            from app.ai.predict import predict_parking
            from app.models.enums import StatusLabel
            from PIL import Image
            import io

            # Validate that the bytes form a readable image before running the model
            try:
                probe = Image.open(io.BytesIO(file_bytes))
                probe.verify()  # Raises if corrupted/truncated
            except Exception as img_err:
                logger.warning(
                    f"CAM-TEST received an unreadable image ({len(file_bytes)} bytes): {img_err}. "
                    "Attempting to process anyway..."
                )
                # Don't raise — PIL.Image.open + convert('RGB') in predict_parking
                # often recovers partial JPEG frames. Only hard-fail if truly empty.
                if len(file_bytes) < 100:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Image is too small or corrupt ({len(file_bytes)} bytes).",
                    )

            ai_result = predict_parking(file_bytes)

            # Override database configuration if necessary to match actual camera view capacity (12 slots)
            total_slots = ai_result["summary"]["total"]
            occupied = ai_result["summary"]["occupied"]
            available = ai_result["summary"]["empty"]
            rate = round(occupied / total_slots, 4) if total_slots > 0 else 0.0
            avg_confidence = ai_result["summary"]["confidence_avg"]
            vehicles_detected = ai_result["summary"]["vehicles_detected"]

            # Determine status label
            if rate < 0.6:
                label = StatusLabel.AVAILABLE.value
            elif rate < 0.85:
                label = StatusLabel.LIMITED.value
            else:
                label = StatusLabel.FULL.value

            logger.info(f"CAM-TEST Slot Occupancy Status: {ai_result['slot_status']}")
        else:
            # Decode and resize image (standard counting mode)
            img = decode_image(file_bytes)
            img = resize_for_inference(img)

            # Run standard YOLOv8 detection
            detections = detection_service.detect_vehicles(img)
            occupied, available, rate, label = detection_service.count_occupied_slots(detections, total_slots)
            avg_confidence = detection_service.get_average_confidence(detections)
            vehicles_detected = len(detections)

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
            vehicles_detected=vehicles_detected,
            confidence_avg=avg_confidence,
            captured_at=now,
            image_url=image_url,
        )

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(
            f"Detection error for camera '{camera_device_id}': {type(e).__name__}: {e}\n"
            + traceback.format_exc()
        )
        raise HTTPException(
            status_code=500,
            detail=f"Image processing failed: {type(e).__name__}: {e}",
        )
