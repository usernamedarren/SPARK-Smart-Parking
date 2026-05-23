"""
SPARK Smart Parking - User Router

Endpoints for user profile and notification preference management.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import UserProfile, UserProfileUpdate, NotificationUpdate, MessageResponse
from app.dependencies import get_current_user, get_supabase_admin

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    return current_user


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's profile (name and/or role)."""
    admin = get_supabase_admin()
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.role is not None:
        update_data["role"] = data.role.value

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = (
        admin.table("users")
        .update(update_data)
        .eq("id", current_user["id"])
        .execute()
    )

    if result.data:
        return result.data[0]
    raise HTTPException(status_code=500, detail="Failed to update profile.")


@router.put("/notifications", response_model=UserProfile)
async def update_notifications(
    data: NotificationUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's notification preference."""
    admin = get_supabase_admin()
    result = (
        admin.table("users")
        .update({"notification_preference": data.notification_preference})
        .eq("id", current_user["id"])
        .execute()
    )

    if result.data:
        return result.data[0]
    raise HTTPException(status_code=500, detail="Failed to update notification preference.")
