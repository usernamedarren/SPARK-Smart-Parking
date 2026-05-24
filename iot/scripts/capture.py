"""
SPARK Smart Parking - ESP32-CAM Capture & Upload Script
Captures a JPEG from the ESP32-CAM and POSTs it to the SPARK backend.

Usage:
    python capture.py

Configuration: edit the constants below.
"""

import os
import sys
import requests
from datetime import datetime

# ──────────────────────────────────────────────────
#  CONFIGURATION — edit these values as needed
# ──────────────────────────────────────────────────

# ESP32-CAM capture endpoint (IP shown on its Serial Monitor after boot)
CAMERA_URL = "http://10.196.153.178/capture"

# SPARK FastAPI backend URL
BACKEND_URL = "http://localhost:8000"

# camera_device_id registered in the database
# Run: python -c "from app.dependencies import get_supabase_admin; ..."
# to list all valid IDs, or use one of:
#   CAM-TEST, CAM-LABTEK-8, CAM-FSRD, CAM-GKUB, CAM-GKUT,
#   CAM-CADL, CAM-ALBAR, CAM-ALTIM, CAM-GKU1, CAM-GKU2,
#   CAM-GKU3, CAM-REKTORAT
CAMERA_DEVICE_ID = "CAM-TEST"

# Optional: save image to disk as well
SAVE_LOCAL = True
SAVE_DIR = "esp32_captures"

# ──────────────────────────────────────────────────


def capture_image() -> bytes | None:
    """Fetch a JPEG snapshot from the ESP32-CAM."""
    print(f"[CAPTURE] Fetching from {CAMERA_URL} ...")
    try:
        resp = requests.get(CAMERA_URL, timeout=10)
        resp.raise_for_status()
        print(f"[CAPTURE] OK — {len(resp.content):,} bytes")
        return resp.content
    except requests.exceptions.ConnectionError:
        print(f"[CAPTURE] ERROR: Cannot reach camera at {CAMERA_URL}")
        print("  → Check the camera IP and make sure it's connected to Wi-Fi.")
        return None
    except requests.exceptions.Timeout:
        print("[CAPTURE] ERROR: Camera connection timed out.")
        return None
    except Exception as e:
        print(f"[CAPTURE] ERROR: {e}")
        return None


def upload_image(image_bytes: bytes) -> bool:
    """POST the image to the SPARK backend."""
    endpoint = f"{BACKEND_URL.rstrip('/')}/iot/upload"
    print(f"[UPLOAD]  POSTing {len(image_bytes):,} bytes → {endpoint}")
    print(f"[UPLOAD]  camera_device_id = {CAMERA_DEVICE_ID!r}")

    try:
        resp = requests.post(
            endpoint,
            files={"image": ("capture.jpg", image_bytes, "image/jpeg")},
            data={"camera_device_id": CAMERA_DEVICE_ID},
            timeout=30,
        )

        if resp.status_code == 200:
            result = resp.json()
            print("[UPLOAD]  SUCCESS!")
            print(f"  Area:          {result.get('parking_area_name')}")
            print(f"  Total Slots:   {result.get('total_slots')}")
            print(f"  Occupied:      {result.get('occupied_slots')}")
            print(f"  Available:     {result.get('available_slots')}")
            rate = result.get("occupancy_rate", 0)
            print(f"  Occupancy:     {rate * 100:.1f}%")
            print(f"  Status:        {result.get('status_label', '').upper()}")
            print(f"  Vehicles:      {result.get('vehicles_detected')}")
            print(f"  Captured At:   {result.get('captured_at')}")
            return True

        elif resp.status_code == 404:
            print(f"[UPLOAD]  ERROR 404: {resp.json().get('detail', resp.text)}")
            print(f"  → Make sure CAMERA_DEVICE_ID='{CAMERA_DEVICE_ID}' exists in the database.")
            return False

        else:
            print(f"[UPLOAD]  ERROR HTTP {resp.status_code}: {resp.text[:200]}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"[UPLOAD]  ERROR: Cannot reach backend at {endpoint}")
        print("  → Is the FastAPI backend running? (uvicorn app.main:app --port 8000)")
        return False
    except requests.exceptions.Timeout:
        print("[UPLOAD]  ERROR: Upload timed out.")
        return False
    except Exception as e:
        print(f"[UPLOAD]  ERROR: {e}")
        return False


def save_locally(image_bytes: bytes) -> str:
    """Save captured image to disk."""
    os.makedirs(SAVE_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(SAVE_DIR, f"capture_{ts}.jpg")
    with open(path, "wb") as f:
        f.write(image_bytes)
    return path


def main():
    print("=" * 55)
    print("  SPARK Smart Parking — Capture & Upload")
    print("=" * 55)

    image_bytes = capture_image()
    if image_bytes is None:
        sys.exit(1)

    if SAVE_LOCAL:
        path = save_locally(image_bytes)
        print(f"[SAVE]    Saved locally: {path}")

    ok = upload_image(image_bytes)
    print()
    print("[DONE] " + ("Upload successful!" if ok else "Upload FAILED."))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()