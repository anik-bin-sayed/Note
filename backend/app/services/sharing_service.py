import secrets
import re
from datetime import datetime, timedelta, timezone

from bson import ObjectId

from app.database import (
    entries_collection,
    note_collaborators_collection,
    shared_notes_collection,
    users_collection,
)


async def create_public_share(owner_id: str, entry_id: str, expires_in_days: int):
    if not ObjectId.is_valid(entry_id):
        return None

    entry = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}
    )
    if not entry or "ciphertext" not in entry or "wrapped_key" not in entry:
        return None

    token = secrets.token_urlsafe(16)
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
    await shared_notes_collection.insert_one(
        {
            "note_id": ObjectId(entry_id),
            "owner_id": owner_id,
            "token": token,
            "permission": "viewer",
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        }
    )
    return {"token": token, "permission": "viewer", "expires_at": expires_at}


async def get_public_share(token: str):
    now = datetime.now(timezone.utc)
    share = await shared_notes_collection.find_one(
        {"token": token, "permission": "viewer", "expires_at": {"$gt": now}}
    )
    if not share:
        return None

    entry = await entries_collection.find_one({"_id": share["note_id"]})
    if not entry or "ciphertext" not in entry:
        return None

    return {
        "id": str(entry["_id"]),
        "ciphertext": entry["ciphertext"],
        "iv": entry["iv"],
        "updated_at": entry["updated_at"],
        "revision": entry.get("revision", 0),
        "expires_at": share["expires_at"],
    }


async def list_public_shares(owner_id: str, entry_id: str):
    if not ObjectId.is_valid(entry_id):
        return None

    note = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}, {"_id": 1}
    )
    if not note:
        return None

    now = datetime.now(timezone.utc)
    result = []
    cursor = shared_notes_collection.find(
        {"note_id": ObjectId(entry_id), "owner_id": owner_id}
    ).sort("created_at", -1)
    async for share in cursor:
        expires_at = share["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        result.append(
            {
                "token": share["token"],
                "permission": share["permission"],
                "expires_at": expires_at,
                "active": expires_at > now,
            }
        )
    return result


async def revoke_public_share(owner_id: str, entry_id: str, token: str) -> bool:
    if not ObjectId.is_valid(entry_id):
        return False

    entry = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}, {"_id": 1}
    )
    if not entry:
        return False

    result = await shared_notes_collection.delete_one(
        {"note_id": ObjectId(entry_id), "owner_id": owner_id, "token": token}
    )
    return result.deleted_count == 1


async def add_collaborator(
    owner_id: str,
    entry_id: str,
    email: str,
    role: str,
):
    if not ObjectId.is_valid(entry_id):
        return None, "note"

    note = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}, {"_id": 1}
    )
    if not note:
        return None, "note"

    normalized_email = email.strip()
    user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}}
    )
    if not user:
        return None, "user"
    user_id = str(user["_id"])
    if user_id == owner_id:
        return None, "self"

    await note_collaborators_collection.update_one(
        {"note_id": ObjectId(entry_id), "user_id": user_id},
        {
            "$set": {
                "role": role,
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )

    return {
        "user_id": user_id,
        "email": user["email"],
        "name": user.get("name"),
        "role": role,
    }, None


async def list_collaborators(owner_id: str, entry_id: str):
    if not ObjectId.is_valid(entry_id):
        return None

    note = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}, {"_id": 1}
    )
    if not note:
        return None

    result = []
    cursor = note_collaborators_collection.find({"note_id": ObjectId(entry_id)})
    async for collaborator in cursor:
        user = await users_collection.find_one(
            {"_id": ObjectId(collaborator["user_id"])},
            {"email": 1, "name": 1},
        )
        if user:
            result.append(
                {
                    "user_id": collaborator["user_id"],
                    "email": user["email"],
                    "name": user.get("name"),
                    "role": collaborator["role"],
                }
            )
    return result


async def remove_collaborator(owner_id: str, entry_id: str, collaborator_id: str):
    if not ObjectId.is_valid(entry_id):
        return False

    note = await entries_collection.find_one(
        {"_id": ObjectId(entry_id), "user_id": owner_id}, {"_id": 1}
    )
    if not note:
        return False

    result = await note_collaborators_collection.delete_one(
        {"note_id": ObjectId(entry_id), "user_id": collaborator_id}
    )
    return result.deleted_count == 1
