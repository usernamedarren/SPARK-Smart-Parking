"""
SPARK Smart Parking - YOLOv8 Detection Service

Vehicle detection pipeline using Ultralytics YOLOv8.
"""

import logging
from typing import Optional

import numpy as np

from app.config import settings
from app.models.enums import StatusLabel

logger = logging.getLogger(__name__)


class DetectionService:
    """
    Singleton service for YOLOv8-based vehicle detection.

    The model is loaded once at startup and reused for all inference calls.
    """

    def __init__(self):
        self._model = None

    def load_model(self):
        """Load the YOLOv8 model from the configured path."""
        from ultralytics import YOLO

        model_path = settings.YOLO_MODEL_PATH
        logger.info(f"Loading YOLOv8 model from: {model_path}")
        self._model = YOLO(model_path)
        logger.info("YOLOv8 model loaded successfully.")

    @property
    def model(self):
        if self._model is None:
            self.load_model()
        return self._model

    def detect_vehicles(self, image: np.ndarray) -> list[dict]:
        """
        Run YOLOv8 inference on an image.

        Args:
            image: numpy array (BGR format from OpenCV)

        Returns:
            List of detections, each containing:
            - x1, y1, x2, y2: bounding box coordinates
            - confidence: detection confidence score
            - class_name: detected class name
        """
        results = self.model(image, verbose=False)

        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for box in boxes:
                # Get class name
                cls_id = int(box.cls[0])
                class_name = result.names.get(cls_id, "unknown")

                # Filter for vehicle classes only
                # COCO classes: car=2, motorcycle=3, bus=5, truck=7
                vehicle_classes = {"car", "motorcycle", "bus", "truck"}
                if class_name not in vehicle_classes:
                    continue

                # Extract bounding box
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])

                detections.append({
                    "x1": xyxy[0],
                    "y1": xyxy[1],
                    "x2": xyxy[2],
                    "y2": xyxy[3],
                    "confidence": conf,
                    "class_name": class_name,
                })

        logger.info(f"Detected {len(detections)} vehicles in image.")
        return detections

    def count_occupied_slots(
        self, detections: list[dict], total_slots: int
    ) -> tuple[int, int, float, str]:
        """
        Calculate parking occupancy from detection results.

        Args:
            detections: List of vehicle detections from detect_vehicles()
            total_slots: Total number of parking slots in the area

        Returns:
            Tuple of (occupied_slots, available_slots, occupancy_rate, status_label)
        """
        # Count vehicles as occupied slots (capped at total_slots)
        occupied = min(len(detections), total_slots)
        available = total_slots - occupied
        rate = occupied / total_slots if total_slots > 0 else 0.0

        # Determine status label based on occupancy rate
        if rate < 0.6:
            label = StatusLabel.AVAILABLE.value
        elif rate < 0.85:
            label = StatusLabel.LIMITED.value
        else:
            label = StatusLabel.FULL.value

        return occupied, available, round(rate, 4), label

    def get_average_confidence(self, detections: list[dict]) -> float:
        """Calculate the average confidence score of all detections."""
        if not detections:
            return 0.0
        return round(
            sum(d["confidence"] for d in detections) / len(detections), 4
        )


# Singleton instance
detection_service = DetectionService()
