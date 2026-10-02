from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.database import entries_collection
from app.services.encryption import (
    decrypt_text,
    encrypt_text,
)


def serialize_entry(entry: dict) -> dict:
    serialized = {
        "id": str(entry["_id"]),
        "user_id": entry["user_id"],
        "created_at": entry["created_at"],
        "updated_at": entry["updated_at"],
    }

    if "ciphertext" in entry:
        serialized.update(
            {
                "ciphertext": entry["ciphertext"],
                "iv": entry["iv"],
            }
        )
    else:
        serialized.update(
            {
                "legacy_title": entry["title"],
                "legacy_text": decrypt_text(entry["text"]),
            }
        )

    return serialized


async def create_entry(
    user_id: str,
    ciphertext: str,
    iv: str,
):
    now = datetime.now(timezone.utc)

    entry = {
        "user_id": user_id,
        "ciphertext": ciphertext,
        "iv": iv,
        "created_at": now,
        "updated_at": now,
    }

    result = await entries_collection.insert_one(entry)

    entry["_id"] = result.inserted_id

    return serialize_entry(entry)


async def get_user_entries(
    user_id: str, page: int = 1, limit: int = 9
):
    skip = (page - 1) * limit
    query = {"user_id": user_id}

    total = await entries_collection.count_documents(query)

    cursor = (
        entries_collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)
    )

    entries = []

    async for entry in cursor:
        entries.append(serialize_entry(entry))

    total_pages = (total + limit - 1) // limit

    return {
        "items": entries,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }


async def get_entry_by_id(
    user_id: str,
    entry_id: str,
):
    if not ObjectId.is_valid(entry_id):
        return None

    entry = await entries_collection.find_one(
        {
            "_id": ObjectId(entry_id),
            "user_id": user_id,
        }
    )

    if not entry:
        return None

    return serialize_entry(entry)


async def delete_entry(user_id: str, entry_id: str):
    if not ObjectId.is_valid(entry_id):
        return False

    result = await entries_collection.delete_one(
        {
            "_id": ObjectId(entry_id),
            "user_id": user_id,
        }
    )

    return result.deleted_count == 1


async def update_entry(
    user_id: str,
    entry_id: str,
    ciphertext: str,
    iv: str,
):
    if not ObjectId.is_valid(entry_id):
        return None

    now = datetime.now(timezone.utc)
    entry = await entries_collection.find_one_and_update(
        {
            "_id": ObjectId(entry_id),
            "user_id": user_id,
        },
        {
            "$set": {
                "ciphertext": ciphertext,
                "iv": iv,
                "updated_at": now,
            },
            "$unset": {
                "title": "",
                "text": "",
            },
        },
        return_document=ReturnDocument.AFTER,
    )

    return serialize_entry(entry) if entry else None
