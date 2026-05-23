"""
SPARK Smart Parking - Shared Dependencies

FastAPI dependencies for Supabase client access and JWT authentication.
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

from app.config import settings

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Supabase client singletons
# ---------------------------------------------------------------------------

_supabase_client: Optional[Client] = None
_supabase_admin: Optional[Client] = None


def get_supabase() -> Client:
    """Get the Supabase client (anon key — respects RLS)."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client


def get_supabase_admin() -> Client:
    """Get the Supabase admin client (service role key — bypasses RLS)."""
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
        )
    return _supabase_admin


# ---------------------------------------------------------------------------
# Auth dependency
# ---------------------------------------------------------------------------


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """
    Extract and verify the JWT from the Authorization header.

    Returns the user record from the `users` table.

    Raises HTTPException 401 if the token is missing or invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Verify the JWT via Supabase Auth
        user_response = supabase.auth.get_user(token)
        if user_response is None or user_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )

        user_id = user_response.user.id

        # Fetch user profile from the `users` table
        admin = get_supabase_admin()
        result = (
            admin.table("users")
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )

        if result.data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please complete registration.",
            )

        return result.data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> Optional[dict]:
    """
    Optional authentication — returns user if token is valid, None otherwise.

    Use this for endpoints that work for both authenticated and anonymous users.
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials, supabase)
    except HTTPException:
        return None
