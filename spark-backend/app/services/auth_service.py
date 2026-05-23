"""
SPARK Smart Parking - Auth Service

Handles user registration and login via Supabase Auth.
"""

import hashlib
import logging
from typing import Optional

from supabase import Client

from app.dependencies import get_supabase, get_supabase_admin
from app.models.enums import UserRole

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service wrapping Supabase Auth."""

    async def register(
        self,
        name: str,
        email: str,
        password: str,
        role: UserRole = UserRole.MAHASISWA,
    ) -> dict:
        """
        Register a new user.

        1. Creates auth user via Supabase Auth
        2. Inserts profile record in `users` table
        3. Returns auth tokens + user profile
        """
        supabase = get_supabase()
        admin = get_supabase_admin()

        # Step 1: Create auth user via Admin API (bypasses public rate limits & auto-confirms email)
        try:
            auth_response = admin.auth.admin.create_user(
                {
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                }
            )
        except Exception as e:
            logger.error(f"Admin user creation failed: {e}")
            raise ValueError("Registration failed. Email may already be in use.")

        if auth_response.user is None:
            raise ValueError("Registration failed. Email may already be in use.")

        user_id = auth_response.user.id
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        # Step 2: Insert profile into `users` table
        profile_data = {
            "id": user_id,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "role": role.value,
            "notification_preference": True,
        }

        try:
            admin.table("users").insert(profile_data).execute()
        except Exception as e:
            logger.error(f"Failed to create user profile: {e}")
            # Profile creation failed — the auth user still exists.
            # In production you'd want to clean up, but for prototype this is acceptable.
            raise ValueError(f"Failed to create user profile: {e}")

        # Step 3: Log in immediately to obtain active access tokens
        access_token = ""
        refresh_token = ""
        try:
            login_response = supabase.auth.sign_in_with_password(
                {"email": email, "password": password}
            )
            session = login_response.session
            if session:
                access_token = session.access_token
                refresh_token = session.refresh_token
        except Exception as e:
            logger.warning(f"Immediate login after registration failed: {e}")

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "role": role.value,
                "notification_preference": True,
            },
        }

    async def login(self, email: str, password: str) -> dict:
        """
        Authenticate a user with email + password.

        Returns auth tokens and user profile.
        """
        supabase = get_supabase()
        admin = get_supabase_admin()

        # Authenticate via Supabase
        auth_response = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )

        if auth_response.user is None:
            raise ValueError("Invalid email or password.")

        user_id = auth_response.user.id
        session = auth_response.session

        # Fetch profile from `users` table
        result = (
            admin.table("users")
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )

        profile = result.data
        if profile is None:
            # Auth user exists but no profile — create one
            profile = {
                "id": user_id,
                "name": auth_response.user.email or "",
                "email": auth_response.user.email or email,
                "password_hash": hashlib.sha256(password.encode()).hexdigest(),
                "role": UserRole.MAHASISWA.value,
                "notification_preference": True,
            }
            try:
                admin.table("users").insert(profile).execute()
            except Exception:
                pass

        return {
            "access_token": session.access_token if session else "",
            "refresh_token": session.refresh_token if session else "",
            "user": profile,
        }

    async def get_profile(self, user_id: str) -> Optional[dict]:
        """Get user profile from the `users` table."""
        admin = get_supabase_admin()
        result = (
            admin.table("users")
            .select("*")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        return result.data


auth_service = AuthService()
