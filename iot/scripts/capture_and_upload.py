"""
SPARK Smart Parking - ESP32-CAM Capture & Upload Script
========================================================
Continuously captures images from an ESP32-CAM's MJPEG stream
and POSTs them to the SPARK FastAPI backend's /iot/upload endpoint.

Usage:
    python capture_and_upload.py [--camera-url URL] [--backend-url URL]
                                 [--camera-id ID] [--interval SECONDS]
                                 [--once] [--save-local]

Example:
    python capture_and_upload.py \\
        --camera-url http://192.168.1.50/capture \\
        --backend-url http://192.168.1.100:8000 \\
        --camera-id CAM-TEST \\
        --interval 30

Requirements:
    pip install requests
"""

import argparse
import os
import sys
import time
from datetime import datetime

try:
    import requests
except ImportError:
    print("Error: 'requests' library not found. Run: pip install requests")
    sys.exit(1)


# ─── Default Configuration ────────────────────────────────────────────────────
DEFAULT_CAMERA_URL   = "http://10.196.153.178/capture"   # ESP32-CAM capture endpoint
DEFAULT_BACKEND_URL  = "http://localhost:8000"           # SPARK FastAPI backend
DEFAULT_CAMERA_ID    = "CAM-TEST"
DEFAULT_INTERVAL_SEC = 30
SAVE_DIR             = "esp32_captures"
# ──────────────────────────────────────────────────────────────────────────────


def capture_image(camera_url: str, timeout: int = 10) -> bytes | None:
    """Fetch a JPEG snapshot from the ESP32-CAM's /capture endpoint."""
    try:
        resp = requests.get(camera_url, timeout=timeout)
        resp.raise_for_status()
        if resp.headers.get("Content-Type", "").startswith("image/"):
            return resp.content
        # Some ESP32 firmwares return the image with no proper content-type
        if len(resp.content) > 1000:  # Likely a real JPEG
            return resp.content
        print(f"  [CAPTURE] Unexpected response type: {resp.headers.get('Content-Type')}")
        return None
    except requests.exceptions.ConnectionError:
        print(f"  [CAPTURE] Cannot reach camera at {camera_url}. Check IP and WiFi.")
        return None
    except requests.exceptions.Timeout:
        print("  [CAPTURE] Camera connection timed out.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [CAPTURE] HTTP error: {e}")
        return None


def upload_to_backend(
    image_bytes: bytes,
    backend_url: str,
    camera_id: str,
    timeout: int = 30,
) -> dict | None:
    """
    POST the image to SPARK backend's /iot/upload endpoint.
    Returns the JSON response dict on success, None on failure.
    """
    endpoint = f"{backend_url.rstrip('/')}/iot/upload"
    try:
        files = {"image": ("capture.jpg", image_bytes, "image/jpeg")}
        data  = {"camera_device_id": camera_id}

        print(f"  [UPLOAD] POST {len(image_bytes):,} bytes → {endpoint}")
        resp = requests.post(endpoint, files=files, data=data, timeout=timeout)

        if resp.status_code == 200:
            result = resp.json()
            return result
        else:
            print(f"  [UPLOAD] Server returned HTTP {resp.status_code}: {resp.text[:300]}")
            return None
    except requests.exceptions.ConnectionError:
        print(f"  [UPLOAD] Cannot reach backend at {endpoint}. Is it running?")
        return None
    except requests.exceptions.Timeout:
        print("  [UPLOAD] Backend upload timed out.")
        return None
    except Exception as e:
        print(f"  [UPLOAD] Unexpected error: {e}")
        return None


def save_image_locally(image_bytes: bytes) -> str:
    """Save the captured image to disk with a timestamp filename."""
    os.makedirs(SAVE_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(SAVE_DIR, f"capture_{ts}.jpg")
    with open(path, "wb") as f:
        f.write(image_bytes)
    return path


def print_result(result: dict) -> None:
    """Pretty-print the detection result from the backend."""
    print("  ┌─ Detection Result ──────────────────────────────")
    print(f"  │  Area:            {result.get('parking_area_name', 'N/A')}")
    print(f"  │  Total Slots:     {result.get('total_slots', 'N/A')}")
    print(f"  │  Occupied:        {result.get('occupied_slots', 'N/A')}")
    print(f"  │  Available:       {result.get('available_slots', 'N/A')}")
    rate = result.get("occupancy_rate", 0)
    print(f"  │  Occupancy Rate:  {rate * 100:.1f}%")
    print(f"  │  Status:          {result.get('status_label', 'N/A').upper()}")
    print(f"  │  Vehicles:        {result.get('vehicles_detected', 'N/A')}")
    print(f"  │  Avg Confidence:  {result.get('confidence_avg', 0):.4f}")
    print(f"  │  Snapshot URL:    {result.get('image_url', 'N/A')}")
    print(f"  │  Captured At:     {result.get('captured_at', 'N/A')}")
    print("  └─────────────────────────────────────────────────")


def run_once(args) -> bool:
    """Capture one image and upload it. Returns True on success."""
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Starting capture cycle...")

    # 1. Capture
    print(f"  [CAPTURE] Fetching from {args.camera_url} ...")
    image_bytes = capture_image(args.camera_url)
    if image_bytes is None:
        print("  [CAPTURE] FAILED — skipping this cycle.")
        return False

    print(f"  [CAPTURE] OK — {len(image_bytes):,} bytes received.")

    # 2. Save locally (optional)
    if args.save_local:
        path = save_image_locally(image_bytes)
        print(f"  [SAVE] Saved locally: {path}")

    # 3. Upload
    result = upload_to_backend(image_bytes, args.backend_url, args.camera_id)
    if result is None:
        print("  [UPLOAD] FAILED.")
        return False

    print("  [UPLOAD] SUCCESS!")
    print_result(result)
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Capture images from ESP32-CAM and upload to SPARK backend.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--camera-url",  default=DEFAULT_CAMERA_URL,
                        help=f"ESP32-CAM capture URL (default: {DEFAULT_CAMERA_URL})")
    parser.add_argument("--backend-url", default=DEFAULT_BACKEND_URL,
                        help=f"SPARK backend URL (default: {DEFAULT_BACKEND_URL})")
    parser.add_argument("--camera-id",  default=DEFAULT_CAMERA_ID,
                        help=f"Camera device ID (default: {DEFAULT_CAMERA_ID})")
    parser.add_argument("--interval",   type=float, default=DEFAULT_INTERVAL_SEC,
                        help=f"Capture interval in seconds (default: {DEFAULT_INTERVAL_SEC})")
    parser.add_argument("--once",       action="store_true",
                        help="Capture and upload once then exit")
    parser.add_argument("--save-local", action="store_true",
                        help=f"Save images locally to ./{SAVE_DIR}/")
    args = parser.parse_args()

    print("=" * 60)
    print("  SPARK Smart Parking — ESP32 Capture & Upload")
    print("=" * 60)
    print(f"  Camera URL:  {args.camera_url}")
    print(f"  Backend URL: {args.backend_url}")
    print(f"  Camera ID:   {args.camera_id}")
    if not args.once:
        print(f"  Interval:    {args.interval}s")
    print(f"  Save Local:  {args.save_local}")
    print("=" * 60)

    if args.once:
        ok = run_once(args)
        sys.exit(0 if ok else 1)

    # Continuous loop
    print(f"\nRunning continuously (Ctrl+C to stop)...\n")
    consecutive_failures = 0
    while True:
        ok = run_once(args)
        if not ok:
            consecutive_failures += 1
            if consecutive_failures >= 5:
                print(f"\n[WARNING] {consecutive_failures} consecutive failures. "
                      "Check camera and backend connectivity.\n")
        else:
            consecutive_failures = 0

        print(f"\n  Next capture in {args.interval:.0f}s...\n")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
