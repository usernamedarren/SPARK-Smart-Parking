from ultralytics import YOLO
from PIL import Image
import numpy as np
import io
import os
import cv2

CONF_THRESHOLD    = 0.4
OVERLAP_THRESHOLD = 0.3
NMS_IOU_THRESHOLD = 0.3

MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
model = YOLO(MODEL_PATH)

SLOT_COORDINATES = {
    "slot_1":  {"p1": (395, 32),  "p2": (587, 85),  "p3": (555, 122), "p4": (353, 63)},
    "slot_2":  {"p1": (348, 68),  "p2": (547, 129), "p3": (509, 170), "p4": (300, 103)},
    "slot_3":  {"p1": (320, 116), "p2": (503, 176), "p3": (457, 224), "p4": (268, 163)},
    "slot_4":  {"p1": (259, 172), "p2": (450, 233), "p3": (397, 289), "p4": (186, 215)},
    "slot_5":  {"p1": (153, 214), "p2": (390, 297), "p3": (324, 374), "p4": (64, 279)},
    "slot_6":  {"p1": (44, 294),  "p2": (314, 389), "p3": (211, 484), "p4": (0, 386)},
    "slot_7":  {"p1": (775, 135), "p2": (1017, 198),"p3": (1007, 248),"p4": (761, 181)},
    "slot_8":  {"p1": (758, 190), "p2": (1006, 261),"p3": (994, 314), "p4": (718, 229)},
    "slot_9":  {"p1": (716, 238), "p2": (944, 307), "p3": (926, 370), "p4": (686, 292)},
    "slot_10": {"p1": (682, 303), "p2": (921, 382), "p3": (897, 464), "p4": (636, 371)},
    "slot_11": {"p1": (629, 383), "p2": (955, 503), "p3": (930, 621), "p4": (590, 480)},
    "slot_12": {"p1": (581, 499), "p2": (926, 645), "p3": (902, 766), "p4": (497, 609)},
}


def calculate_overlap(car_mask, slot_polygon, img_h, img_w) -> float:
    """Calculate overlap ratio between a car mask and a slot polygon."""
    car_mask_img  = np.zeros((img_h, img_w), dtype=np.uint8)
    slot_mask_img = np.zeros((img_h, img_w), dtype=np.uint8)

    car_poly  = np.array(car_mask, dtype=np.int32)
    slot_poly = np.array([
        slot_polygon["p1"], slot_polygon["p2"],
        slot_polygon["p3"], slot_polygon["p4"]
    ], dtype=np.int32)

    cv2.fillPoly(car_mask_img,  [car_poly],  1)
    cv2.fillPoly(slot_mask_img, [slot_poly], 1)

    intersection = np.logical_and(car_mask_img, slot_mask_img).sum()
    car_area     = car_mask_img.sum()
    slot_area    = slot_mask_img.sum()

    if car_area == 0 or slot_area == 0:
        return 0.0

    return float(intersection / min(car_area, slot_area))


def calculate_iou_masks(mask1, mask2, img_h, img_w) -> float:
    """Calculate IoU between 2 vehicle masks for NMS."""
    m1 = np.zeros((img_h, img_w), dtype=np.uint8)
    m2 = np.zeros((img_h, img_w), dtype=np.uint8)
    cv2.fillPoly(m1, [np.array(mask1, dtype=np.int32)], 1)
    cv2.fillPoly(m2, [np.array(mask2, dtype=np.int32)], 1)

    intersection = np.logical_and(m1, m2).sum()
    union        = np.logical_or(m1, m2).sum()

    if union == 0:
        return 0.0
    return float(intersection / union)


def apply_nms(masks, confs, img_h, img_w, iou_threshold=NMS_IOU_THRESHOLD) -> list:
    """
    Remove duplicate detections using mask-based IoU.
    Keep the detection with the highest confidence score.
    """
    indices = sorted(range(len(confs)), key=lambda i: confs[i], reverse=True)
    kept    = []
    for i in indices:
        dominated = False
        for j in kept:
            if calculate_iou_masks(masks[i], masks[j], img_h, img_w) > iou_threshold:
                dominated = True
                break
        if not dominated:
            kept.append(i)
    return kept


def predict_parking(image_bytes: bytes) -> dict:
    """
    Predict slot occupancy for CAM-TEST using custom YOLOv8-segmentation model.
    Handles truncated/partial JPEG frames that may arrive from ESP32-CAM.
    """
    import PIL.ImageFile
    PIL.ImageFile.LOAD_TRUNCATED_IMAGES = True  # Tolerate partial JPEG from ESP32

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")  # Ensures full decode + normalizes to RGB
    except Exception as e:
        raise ValueError(f"Cannot decode image bytes ({len(image_bytes)} bytes): {e}")

    results = model(image, conf=CONF_THRESHOLD, verbose=False)

    img_h, img_w = results[0].orig_shape

    # Extract masks and confidences from YOLO results
    masks = []
    confs = []
    if results[0].masks is not None:
        for i in range(len(results[0].boxes)):
            masks.append(results[0].masks.xy[i])
            confs.append(float(results[0].boxes[i].conf))

    # Apply NMS to remove duplicate detections
    valid_indices = apply_nms(masks, confs, img_h, img_w, NMS_IOU_THRESHOLD)

    # Check which slots are occupied
    slot_status = {slot_id: "empty" for slot_id in SLOT_COORDINATES}
    for i in valid_indices:
        for slot_id, slot_box in SLOT_COORDINATES.items():
            overlap = calculate_overlap(masks[i], slot_box, img_h, img_w)
            if overlap > OVERLAP_THRESHOLD:
                slot_status[slot_id] = "occupied"

    occupied = sum(1 for status in slot_status.values() if status == "occupied")

    # Calculate average confidence of valid detections
    avg_confidence = float(np.mean([confs[i] for i in valid_indices])) if valid_indices else 0.0

    return {
        "slot_status": slot_status,
        "summary": {
            "total":             len(SLOT_COORDINATES),
            "occupied":          occupied,
            "empty":             len(SLOT_COORDINATES) - occupied,
            "confidence_avg":    round(avg_confidence, 4),
            "vehicles_detected": len(valid_indices)
        }
    }