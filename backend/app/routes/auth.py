from fastapi import APIRouter, Cookie, HTTPException, Response, status
from fastapi.responses import RedirectResponse

from app.database import users_collection

from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.services.google_auth import (
    create_google_authorization_url,
    exchange_code_for_token,
    get_google_user,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.get("/google")
async def google_login(response: Response):
    authorization_url, state = create_google_authorization_url()

    response = RedirectResponse(
        authorization_url,
        status_code=status.HTTP_302_FOUND,
    )

    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )

    return response


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    oauth_state: str | None = Cookie(default=None),
):
    if not oauth_state or state != oauth_state:
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state",
        )

    try:
        token_data = await exchange_code_for_token(code)

        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=400,
                detail="Google access token not found",
            )

        google_user = await get_google_user(access_token)

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Google authentication failed",
        )

    google_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name")
    picture = google_user.get("picture")

    if not google_id or not email:
        raise HTTPException(
            status_code=400,
            detail="Google user information is incomplete",
        )

    # Check existing user
    existing_user = await users_collection.find_one({"google_id": google_id})

    if existing_user:
        # Update user information
        await users_collection.update_one(
            {"google_id": google_id},
            {
                "$set": {
                    "email": email,
                    "name": name,
                    "picture": picture,
                }
            },
        )

        user_id = str(existing_user["_id"])

    else:
        # Create new user
        result = await users_collection.insert_one(
            {
                "google_id": google_id,
                "email": email,
                "name": name,
                "picture": picture,
            }
        )

        user_id = str(result.inserted_id)

    # Create our JWT
    access_token = create_access_token(user_id=user_id)

    refresh_token = create_refresh_token(user_id=user_id)

    response = RedirectResponse(
        url=f"{settings.FRONTEND_URL}/",
        status_code=status.HTTP_302_FOUND,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
    )

    response.delete_cookie(key="oauth_state")

    return response


@router.get("/me")
async def get_current_user(
    access_token: str | None = Cookie(default=None),
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = decode_access_token(access_token)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    from bson import ObjectId

    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user id",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "google_id": user["google_id"],
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
    }


@router.post("/refresh")
async def refresh_access_token(
    refresh_token: str | None = Cookie(default=None),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
        )

    try:
        payload = decode_refresh_token(refresh_token)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    new_access_token = create_access_token(user_id=user_id)

    response = Response(
        content='{"message":"Access token refreshed successfully"}',
        media_type="application/json",
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
    )

    return response


@router.post("/logout")
async def logout():
    response = Response(
        content='{"message":"Logged out successfully"}',
        media_type="application/json",
    )

    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return response
