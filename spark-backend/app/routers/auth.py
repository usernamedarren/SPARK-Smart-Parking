"""
SPARK Smart Parking - Auth Router

Endpoints for user registration, login, and profile retrieval.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.schemas import UserRegister, UserLogin, AuthResponse, UserProfile, MessageResponse
from app.services.auth_service import auth_service
from app.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    """Register a new user account."""
    try:
        result = await auth_service.register(
            name=data.name, email=data.email,
            password=data.password, role=data.role,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed.")


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin):
    """Authenticate and receive access tokens."""
    try:
        result = await auth_service.login(email=data.email, password=data.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed.")


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user
