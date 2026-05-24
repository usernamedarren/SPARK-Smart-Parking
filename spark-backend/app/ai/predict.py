from ultralytics import YOLO
from PIL import Image
import numpy as np
import io
import os
import cv2

CONF_THRESHOLD    = 0.4
OVERLAP_THRESHOLD = 0.4

MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
model = YOLO(MODEL_PATH)

SLOT_COORDINATES = {
    "slot_1": {"p1": (395, 32), "p2": (587, 85), "p3": (555, 122), "p4": (353, 63)},
    "slot_2": {"p1": (348, 68), "p2": (547, 129), "p3": (509, 170), "p4": (300, 103)},
    "slot_3": {"p1": (320, 116), "p2": (503, 176), "p3": (457, 224), "p4": (268, 163)},
    "slot_4": {"p1": (259, 172), "p2": (450, 233), "p3": (397, 289), "p4": (186, 215)},
    "slot_5": {"p1": (153, 214), "p2": (390, 297), "p3": (324, 374), "p4": (64, 279)},
    "slot_6": {"p1": (44, 294), "p2": (314, 389), "p3": (211, 484), "p4": (0, 386)},
    "slot_7": {"p1": (775, 135), "p2": (1017, 198), "p3": (1007, 248), "p4": (761, 181)},
    "slot_8": {"p1": (758, 190), "p2": (1006, 261), "p3": (994, 314), "p4": (718, 229)},
    "slot_9": {"p1": (716, 238), "p2": (944, 307), "p3": (926, 370), "p4": (686, 292)},
    "slot_10": {"p1": (682, 303), "p2": (921, 382), "p3": (897, 464), "p4": (636, 371)},
    "slot_11": {"p1": (629, 383), "p2": (955, 503), "p3": (930, 621), "p4": (590, 480)},
    "slot_12": {"p1": (581, 499), "p2": (926, 645), "p3": (902, 766), "p4": (497, 609)},
}

def calculate_overlap(car_box: tuple, slot_polygon: dict) -> float:
    cx1, cy1, cx2, cy2 = car_box

    car_poly = np.array([
        [cx1, cy1], [cx2, cy1],
        [cx2, cy2], [cx1, cy2]
    ], dtype=np.float32)

    slot_poly = np.array([
        slot_polygon["p1"], slot_polygon["p2"],
        slot_polygon["p3"], slot_polygon["p4"]
    ], dtype=np.float32)

    intersection, _ = cv2.intersectConvexConvex(car_poly, slot_poly)

    if intersection == 0:
        return 0.0

    slot_area = cv2.contourArea(slot_poly)
    if slot_area == 0:
        return 0.0

    return intersection / slot_area

def predict_parking(image_bytes: bytes) -> dict:
    image   = Image.open(io.BytesIO(image_bytes))
    results = model(image, conf=CONF_THRESHOLD)

    car_detections = []
    if results[0].masks is not None:
        for i in range(len(results[0].boxes)):
            car_detections.append({
                "mask":       results[0].masks.xy[i],
                "confidence": float(results[0].boxes[i].conf)
            })

    slot_status = {}
    img_h, img_w = results[0].orig_shape

    for slot_id, slot_box in SLOT_COORDINATES.items():
        slot_status[slot_id] = "empty"
        for car in car_detections:
            overlap = calculate_overlap(car["mask"], slot_box, img_h, img_w)
            if overlap > OVERLAP_THRESHOLD:
                slot_status[slot_id] = "occupied"
                break

    occupied = sum(1 for s in slot_status.values() if s == "occupied")

    return {
        "slot_status": slot_status,
        "summary": {
            "total":    len(SLOT_COORDINATES),
            "occupied": occupied,
            "empty":    len(SLOT_COORDINATES) - occupied,
        }
    }