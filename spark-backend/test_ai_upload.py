import httpx
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

API_URL = "http://localhost:8000/iot/upload"
IMAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../spark-ai/tools/empty_slots.jpg"))
CAMERA_ID = "CAM-TEST"

def run_test():
    print("=== SPARK SMART PARKING: AI BACKEND INTEGRATION TEST ===")
    
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: Test image not found at {IMAGE_PATH}")
        sys.exit(1)
        
    print(f"Loading test image from: {IMAGE_PATH}")
    print(f"Uploading to API: {API_URL}")
    print(f"Camera Device ID: {CAMERA_ID}")
    
    # 1. Send the image to the FastAPI backend upload endpoint
    try:
        with open(IMAGE_PATH, "rb") as f:
            files = {"image": ("empty_slots.jpg", f, "image/jpeg")}
            data = {"camera_device_id": CAMERA_ID}
            
            print("Sending POST request to IoT upload endpoint...")
            response = httpx.post(API_URL, files=files, data=data, timeout=30.0)
            
        print(f"Response Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print("Error details from API:")
            print(response.text)
            sys.exit(1)
            
        result = response.json()
        print("\n--- Detection Result from API ---")
        print(f"Parking Area ID:   {result.get('parking_area_id')}")
        print(f"Parking Area Name: {result.get('parking_area_name')}")
        print(f"Total Slots:       {result.get('total_slots')}")
        print(f"Occupied Slots:    {result.get('occupied_slots')}")
        print(f"Available Slots:   {result.get('available_slots')}")
        print(f"Occupancy Rate:    {result.get('occupancy_rate') * 100:.2f}%")
        print(f"Status Label:      {result.get('status_label')}")
        print(f"Vehicles Detected: {result.get('vehicles_detected')}")
        print(f"Average Conf:      {result.get('confidence_avg')}")
        print(f"Snapshot Image URL:{result.get('image_url')}")
        print(f"Captured At:       {result.get('captured_at')}")
        print("---------------------------------\n")
        
    except Exception as e:
        print(f"Failed to communicate with local FastAPI server: {e}")
        print("Make sure your FastAPI backend is running on http://localhost:8000")
        sys.exit(1)
        
    # 2. Query Supabase directly to verify the DB records are updated
    print("Connecting directly to Supabase to verify database updates...")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env. Skipping direct DB verification.")
        print("Test successfully completed (API verified).")
        return
        
    try:
        supabase = create_client(supabase_url, supabase_key)
        
        # Get the parking area info
        area_res = supabase.table("parking_areas").select("*").eq("camera_device_id", CAMERA_ID).maybe_single().execute()
        area_data = area_res.data
        
        if not area_data:
            print(f"Error: Area with camera '{CAMERA_ID}' not found in DB!")
            sys.exit(1)
            
        area_id = area_data["id"]
        
        # Get the current status
        status_res = supabase.table("parking_status").select("*").eq("parking_area_id", area_id).maybe_single().execute()
        status_data = status_res.data
        
        print("\n--- Current Status from Supabase Table ---")
        if status_data:
            print(f"Occupied Slots:  {status_data.get('occupied_slots')}")
            print(f"Available Slots: {status_data.get('available_slots')}")
            print(f"Occupancy Rate:  {status_data.get('occupancy_rate') * 100:.2f}%")
            print(f"Status Label:    {status_data.get('status_label')}")
            print(f"Captured At:     {status_data.get('captured_at')}")
            print(f"Updated At:      {status_data.get('updated_at')}")
            
            # Check synchronization
            assert status_data.get("occupied_slots") == result.get("occupied_slots"), "Occupied slots mismatch!"
            assert status_data.get("available_slots") == result.get("available_slots"), "Available slots mismatch!"
            print("\n[SUCCESS] Verification successful! Supabase table is perfectly in sync with API results.")
        else:
            print("Error: No status record found in Supabase for this area!")
            sys.exit(1)
            
        # Get history records to make sure they were logged
        history_res = supabase.table("parking_history").select("*").eq("parking_area_id", area_id).order("recorded_at", desc=True).limit(1).execute()
        history_data = history_res.data
        
        print("\n--- Latest History Record from Supabase Table ---")
        if history_data:
            latest = history_data[0]
            print(f"Occupied Slots:  {latest.get('occupied_slots')}")
            print(f"Available Slots: {latest.get('available_slots')}")
            print(f"Occupancy Rate:  {latest.get('occupancy_rate') * 100:.2f}%")
            print(f"Recorded At:     {latest.get('recorded_at')}")
            print("\n[SUCCESS] History verification successful!")
        else:
            print("Error: No history record found in Supabase for this area!")
            sys.exit(1)
            
        print("\n[COMPLETE] End-to-end integration test completed successfully with 100% SUCCESS!")
        
    except Exception as e:
        print(f"Failed to query Supabase: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_test()
