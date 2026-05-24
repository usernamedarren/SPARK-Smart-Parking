import os
from ultralytics import YOLO

model_path = "app/ai/best.pt"
print(f"Loading model from {model_path}...")
model = YOLO(model_path)
print("Model loaded successfully!")
print("Model Task:", model.task)
print("Model Names:", model.names)
