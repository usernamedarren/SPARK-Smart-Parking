import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    exit(1)

supabase = create_client(supabase_url, supabase_key)

# 12 parking areas with coordinate and slot configurations matching the frontend Leaflet map
parking_areas = [
    # ITB Ganesha Campus Areas
    {
        "id": "742aaa56-257c-49d1-81c3-3bee75ee9133", # Keep fixed ID for CAM-TEST
        "name": "LABTEK 5",
        "location_description": "ITB Ganesha - Labtek V / SR Area",
        "latitude": -6.8905,
        "longitude": 107.6100,
        "total_slots": 20,
        "camera_device_id": "CAM-TEST"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "LABTEK 8",
        "location_description": "ITB Ganesha - Labtek VIII Area",
        "latitude": -6.8910,
        "longitude": 107.6115,
        "total_slots": 15,
        "camera_device_id": "CAM-LABTEK-8"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "FSRD",
        "location_description": "ITB Ganesha - FSRD Area",
        "latitude": -6.8920,
        "longitude": 107.6105,
        "total_slots": 18,
        "camera_device_id": "CAM-FSRD"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "GKUB",
        "location_description": "ITB Ganesha - GKU Barat Area",
        "latitude": -6.8915,
        "longitude": 107.6120,
        "total_slots": 25,
        "camera_device_id": "CAM-GKUB"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "GKUT",
        "location_description": "ITB Ganesha - GKU Timur Area",
        "latitude": -6.8918,
        "longitude": 107.6110,
        "total_slots": 30,
        "camera_device_id": "CAM-GKUT"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "name": "CADL",
        "location_description": "ITB Ganesha - CADL Area",
        "latitude": -6.8908,
        "longitude": 107.6108,
        "total_slots": 12,
        "camera_device_id": "CAM-CADL"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440006",
        "name": "ALBAR",
        "location_description": "ITB Ganesha - Aula Barat Area",
        "latitude": -6.8925,
        "longitude": 107.6100,
        "total_slots": 40,
        "camera_device_id": "CAM-ALBAR"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440007",
        "name": "ALTIM",
        "location_description": "ITB Ganesha - Aula Timur Area",
        "latitude": -6.8925,
        "longitude": 107.6115,
        "total_slots": 35,
        "camera_device_id": "CAM-ALTIM"
    },
    # ITB Jatinangor Campus Areas
    {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "name": "GKU 1",
        "location_description": "ITB Jatinangor - GKU 1 Area",
        "latitude": -6.9270,
        "longitude": 107.7735,
        "total_slots": 40,
        "camera_device_id": "CAM-GKU1"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440009",
        "name": "GKU 2",
        "location_description": "ITB Jatinangor - GKU 2 Area",
        "latitude": -6.9280,
        "longitude": 107.7745,
        "total_slots": 35,
        "camera_device_id": "CAM-GKU2"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "GKU 3",
        "location_description": "ITB Jatinangor - GKU 3 Area",
        "latitude": -6.9275,
        "longitude": 107.7750,
        "total_slots": 45,
        "camera_device_id": "CAM-GKU3"
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "name": "REKTORAT",
        "location_description": "ITB Jatinangor - Rektorat Area",
        "latitude": -6.9265,
        "longitude": 107.7740,
        "total_slots": 20,
        "camera_device_id": "CAM-REKTORAT"
    }
]

def seed_database():
    try:
        print("Cleaning up old data in parking_status and parking_areas...")
        # Clean existing status and areas to avoid foreign key or primary key conflicts
        supabase.table("parking_status").delete().neq("parking_area_id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("parking_areas").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("Seeding parking_areas...")
        # Insert new areas
        res_areas = supabase.table("parking_areas").insert(parking_areas).execute()
        print(f"Successfully seeded {len(res_areas.data)} parking areas.")
        
        print("Seeding initial parking_status values...")
        now = datetime.now(timezone.utc).isoformat()
        
        # We will initialize with some randomized occupied slots to make it look realistic on load
        import random
        random.seed(42) # Deterministic for consistent testing
        
        parking_status_records = []
        for area in parking_areas:
            total = area["total_slots"]
            # Let's say between 20% and 80% slots are occupied initially
            occupied = int(total * random.uniform(0.2, 0.8))
            available = total - occupied
            rate = float(occupied) / total
            
            if rate < 0.6:
                label = "available"
            elif rate < 0.85:
                label = "limited"
            else:
                label = "full"
                
            parking_status_records.append({
                "parking_area_id": area["id"],
                "occupied_slots": occupied,
                "available_slots": available,
                "occupancy_rate": rate,
                "status_label": label,
                "captured_at": now,
                "updated_at": now
            })
            
        res_status = supabase.table("parking_status").insert(parking_status_records).execute()
        print(f"Successfully seeded {len(res_status.data)} initial parking statuses.")
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print("Seeding failed:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_database()
