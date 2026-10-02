from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_current_user_id
from app.schemas.sharing import (
    CollaboratorCreate,
    CollaboratorResponse,
    NotificationResponse,
    PublicShareCreate,
)
from app.services.sharing_service import (
    add_collaborator,
    create_public_share,
    get_public_share,
    list_public_shares,
    list_collaborators,
    remove_collaborator,
    revoke_public_share,
)
from app.database import notifications_collection
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/api", tags=["Sharing"])


@router.post(
    "/entries/{entry_id}/shares",
    status_code=status.HTTP_201_CREATED,
)
async def create_share_link(
    entry_id: str,
    data: PublicShareCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    share = await create_public_share(
        owner_id=current_user_id,
        entry_id=entry_id,
        expires_in_days=data.expires_in_days,
    )
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or not ready for sharing",
        )
    return share


@router.get("/entries/{entry_id}/shares")
async def get_share_links(
    entry_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    shares = await list_public_shares(current_user_id, entry_id)
    if shares is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    return shares


@router.delete("/entries/{entry_id}/shares/{token}", status_code=204)
async def delete_share_link(
    entry_id: str,
    token: str,
    current_user_id: str = Depends(get_current_user_id),
):
    revoked = await revoke_public_share(current_user_id, entry_id, token)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found",
        )
    return None


@router.get("/shares/{token}")
async def read_shared_note(token: str):
    share = await get_public_share(token)
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link is invalid, expired, or revoked",
        )
    return share


@router.get(
    "/entries/{entry_id}/collaborators",
    response_model=list[CollaboratorResponse],
)
async def get_collaborators(
    entry_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    collaborators = await list_collaborators(current_user_id, entry_id)
    if collaborators is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    return collaborators


@router.post(
    "/entries/{entry_id}/collaborators",
    response_model=CollaboratorResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_collaborator(
    entry_id: str,
    data: CollaboratorCreate,
    current_user_id: str = Depends(get_current_user_id),
):
    collaborator, reason = await add_collaborator(
        owner_id=current_user_id,
        entry_id=entry_id,
        email=data.email,
        role=data.role,
        key_envelope=data.key_envelope,
    )
    if reason == "user":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found for that email",
        )
    if reason == "self":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already own this note",
        )
    if not collaborator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )
    return collaborator


@router.get("/notifications", response_model=list[NotificationResponse])
async def get_notifications(
    current_user_id: str = Depends(get_current_user_id),
):
    notifications = []
    cursor = (
        notifications_collection.find({"user_id": current_user_id})
        .sort("created_at", -1)
        .limit(50)
    )
    async for item in cursor:
        notifications.append(
            {
                "id": str(item["_id"]),
                "type": item["type"],
                "message": item["message"],
                "note_id": str(item["note_id"]),
                "role": item["role"],
                "created_at": item["created_at"],
                "read_at": item.get("read_at"),
            }
        )
    return notifications


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    item = await notifications_collection.find_one_and_update(
        {"_id": ObjectId(notification_id), "user_id": current_user_id},
        {"$set": {"read_at": datetime.now(timezone.utc)}},
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return {"id": notification_id, "read": True}


@router.delete(
    "/entries/{entry_id}/collaborators/{collaborator_id}",
    status_code=204,
)
async def remove_note_collaborator(
    entry_id: str,
    collaborator_id: str,
    current_user_id: str = Depends(get_current_user_id),
):
    removed = await remove_collaborator(
        owner_id=current_user_id,
        entry_id=entry_id,
        collaborator_id=collaborator_id,
    )
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collaborator not found",
        )
    return None
