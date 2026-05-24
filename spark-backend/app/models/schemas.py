"""
SPARK Smart Parking - Pydantic Schemas

Request and response models for all API endpoints.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole, StatusLabel, ReservationStatus


# ============================================================
# Auth Schemas
# ============================================================

class UserRegister(BaseModel):
    """Registration request body."""
    name: str = Field(..., min_length=2, max_length=100, examples=["Darren Mansyl"])
    email: EmailStr = Field(..., examples=["darren@students.itb.ac.id"])
    password: str = Field(..., min_length=6, examples=["securepassword123"])
    role: UserRole = Field(default=UserRole.MAHASISWA, examples=["mahasiswa"])


class UserLogin(BaseModel):
    """Login request body."""
    email: EmailStr = Field(..., examples=["darren@students.itb.ac.id"])
    password: str = Field(..., examples=["securepassword123"])


class AuthResponse(BaseModel):
    """Authentication response with tokens."""
    access_token: str
    refresh_token: str
    user: "UserProfile"


class TokenData(BaseModel):
    """Decoded JWT token payload."""
    user_id: str
    email: str


# ============================================================
# User Schemas
# ============================================================

class UserProfile(BaseModel):
    """User profile response."""
    id: str
    name: str
    email: str
    role: UserRole
    notification_preference: bool = True
    created_at: Optional[datetime] = None


class UserProfileUpdate(BaseModel):
    """Update profile request body."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[UserRole] = None


class NotificationUpdate(BaseModel):
    """Update notification preference."""
    notification_preference: bool


class ChangePasswordRequest(BaseModel):
    """Request body for changing user password."""
    new_password: str = Field(..., min_length=6, examples=["newsecurepassword123"])


# ============================================================
# Parking Area Schemas
# ============================================================

class ParkingArea(BaseModel):
    """Parking area information."""
    id: str
    name: str
    location_description: Optional[str] = None
    latitude: float
    longitude: float
    total_slots: int
    camera_device_id: Optional[str] = None
    created_at: Optional[datetime] = None


# ============================================================
# Parking Status Schemas
# ============================================================

class ParkingStatus(BaseModel):
    """Current parking status for an area."""
    id: str
    parking_area_id: str
    occupied_slots: int
    available_slots: int
    occupancy_rate: float
    status_label: StatusLabel
    captured_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ParkingAreaWithStatus(BaseModel):
    """Combined parking area info with current status."""
    id: str
    name: str
    location_description: Optional[str] = None
    latitude: float
    longitude: float
    total_slots: int
    camera_device_id: Optional[str] = None
    occupied_slots: int = 0
    available_slots: int = 0
    occupancy_rate: float = 0.0
    status_label: StatusLabel = StatusLabel.AVAILABLE
    captured_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    image_url: Optional[str] = None


# ============================================================
# Parking History Schemas
# ============================================================

class ParkingHistory(BaseModel):
    """Historical parking occupancy record."""
    id: str
    parking_area_id: str
    occupied_slots: int
    available_slots: int
    occupancy_rate: float
    recorded_at: Optional[datetime] = None


class ParkingHistoryQuery(BaseModel):
    """Query parameters for parking history."""
    limit: int = Field(default=50, ge=1, le=500)
    offset: int = Field(default=0, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# ============================================================
# Parking Reservation Schemas
# ============================================================

class ParkingReservation(BaseModel):
    """Parking reservation record."""
    id: str
    user_id: str
    parking_area_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: ReservationStatus = ReservationStatus.CONFIRMED
    created_at: Optional[datetime] = None


# ============================================================
# IoT / Detection Schemas
# ============================================================

class DetectionResult(BaseModel):
    """Result from YOLOv8 vehicle detection."""
    parking_area_id: str
    parking_area_name: str
    total_slots: int
    occupied_slots: int
    available_slots: int
    occupancy_rate: float
    status_label: StatusLabel
    vehicles_detected: int
    confidence_avg: float
    captured_at: datetime
    image_url: Optional[str] = None


class DetectionBox(BaseModel):
    """Single detected vehicle bounding box."""
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_name: str


# ============================================================
# Recommendation Schemas
# ============================================================

class RecommendationRequest(BaseModel):
    """Query parameters for parking recommendation."""
    destination: str = Field(..., examples=["GKU Barat"])


class RecommendationItem(BaseModel):
    """Single parking recommendation result."""
    area_id: str
    area_name: str
    available_slots: int
    total_slots: int
    occupancy_rate: float
    status_label: StatusLabel
    distance_km: float
    estimated_walk_minutes: float
    score: float


class RecommendationResponse(BaseModel):
    """Recommendation response with destination info."""
    destination: str
    recommendations: list[RecommendationItem]


# ============================================================
# Prediction Schemas
# ============================================================

class PredictionRequest(BaseModel):
    """Query parameters for availability prediction."""
    area_id: str
    arrival_time: datetime


class PredictionResponse(BaseModel):
    """Predicted parking availability at a future time."""
    area_id: str
    area_name: str
    arrival_time: datetime
    current_available_slots: int
    predicted_available_slots: int
    predicted_occupancy_rate: float
    predicted_status_label: StatusLabel
    confidence: float
    sample_size: int


# ============================================================
# Common Response Schemas
# ============================================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response format."""
    detail: str
    success: bool = False
