"""
SPARK Smart Parking - Enum Definitions

Enumerations used across the application for type-safe status values.
"""

from enum import Enum


class UserRole(str, Enum):
    """User role types for ITB campus."""
    MAHASISWA = "mahasiswa"
    TENAGA_DIDIK = "tenaga_didik"


class StatusLabel(str, Enum):
    """Parking area status labels based on occupancy rate."""
    AVAILABLE = "available"   # occupancy_rate < 0.6
    LIMITED = "limited"       # 0.6 <= occupancy_rate < 0.85
    FULL = "full"             # occupancy_rate >= 0.85


class ReservationStatus(str, Enum):
    """Parking reservation status types."""
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    EXPIRED = "expired"
