import os
import requests
from datetime import datetime

CAMERA_URL = "http://10.196.153.178/capture"
SAVE_DIR = "esp32_captures"

os.makedirs(SAVE_DIR, exist_ok=True)

try:
    response = requests.get(CAMERA_URL, timeout=10)
    response.raise_for_status()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"capture_{timestamp}.jpg"
    file_path = os.path.join(SAVE_DIR, filename)

    with open(file_path, "wb") as file:
        file.write(response.content)

    print(f"Image saved: {file_path}")

except Exception as e:
    print(f"Failed to capture image: {e}")