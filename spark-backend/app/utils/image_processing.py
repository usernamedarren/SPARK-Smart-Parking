"""
SPARK Smart Parking - Image Processing Utilities

Helper functions for decoding and preparing images for YOLOv8 inference.
"""

import io
import logging

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def decode_image(file_bytes: bytes) -> np.ndarray:
    """
    Decode image bytes (JPEG/PNG) into a numpy array (BGR).

    Args:
        file_bytes: Raw image bytes from an uploaded file

    Returns:
        OpenCV image as numpy array (BGR color space)

    Raises:
        ValueError: If the image cannot be decoded
    """
    try:
        # Method 1: Using PIL for more robust decoding
        pil_image = Image.open(io.BytesIO(file_bytes))
        pil_image = pil_image.convert("RGB")
        image = np.array(pil_image)
        # Convert RGB to BGR (OpenCV format)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        return image
    except Exception as e:
        logger.error(f"PIL decode failed: {e}, trying OpenCV...")

    # Method 2: Fallback to OpenCV
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Could not decode image. Ensure it is a valid JPEG or PNG.")

    return image


def resize_for_inference(
    image: np.ndarray,
    target_size: int = 640,
) -> np.ndarray:
    """
    Resize an image to the target size for YOLOv8 inference while
    maintaining the aspect ratio.

    Args:
        image: OpenCV image (BGR)
        target_size: Target size for the longest dimension (default 640)

    Returns:
        Resized image
    """
    h, w = image.shape[:2]

    if max(h, w) <= target_size:
        return image

    scale = target_size / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)

    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
    logger.debug(f"Resized image from {w}x{h} to {new_w}x{new_h}")
    return resized
