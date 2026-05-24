import cv2
import numpy as np

img_original = cv2.imread("spark-ai/tools/empty_slots.jpg")
img = img_original.copy()
slots = {}
current_slot = 1
points = []
total_slots = 12

urutan = ["kiri atas", "kanan atas", "kanan bawah", "kiri bawah"]

def klik(event, x, y, flags, param):
    global points, current_slot, img

    if event == cv2.EVENT_LBUTTONDOWN:
        points.append((x, y))
        idx = len(points) - 1

        cv2.circle(img, (x, y), 5, (0, 255, 255), -1)
        cv2.putText(img, str(idx + 1), (x + 5, y - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

        print(f"  Titik {len(points)} ({urutan[idx]}): ({x}, {y}) \n")

        if len(points) == 4:
            slots[f"slot_{current_slot}"] = {
                "p1": points[0],  # kiri atas
                "p2": points[1],  # kanan atas
                "p3": points[2],  # kanan bawah
                "p4": points[3],  # kiri bawah
            }

            poly = np.array(points, np.int32)
            cv2.polylines(img, [poly], isClosed=True, color=(0, 255, 0), thickness=2)
            cv2.putText(img, f"slot_{current_slot}",
                        (points[0][0], points[0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

            points = []
            current_slot += 1

            if current_slot > total_slots:
                print("SLOT_COORDINATES = {")
                for k, v in slots.items():
                    print(f'    "{k}": {{"p1": {v["p1"]}, "p2": {v["p2"]}, "p3": {v["p3"]}, "p4": {v["p4"]}}},')
                print("}")

cv2.namedWindow("Define Slots")
cv2.setMouseCallback("Define Slots", klik)

print("  Klik 1 → kiri atas")
print("  Klik 2 → kanan atas")
print("  Klik 3 → kanan bawah")
print("  Klik 4 → kiri bawah")
print()

while True:
    cv2.imshow("Define Slots", img)
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or current_slot > total_slots:
        break

cv2.destroyAllWindows()