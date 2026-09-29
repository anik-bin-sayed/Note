from datetime import datetime, timezone

from bson import ObjectId

from app.database import entries_collection
from app.services.encryption import (
    decrypt_text,
    encrypt_text,
)


def serialize_entry(entry: dict) -> dict:
    return {
        "id": str(entry["_id"]),
        "user_id": entry["user_id"],
        "title": entry["title"],
        "text": decrypt_text(entry["text"]),
        "created_at": entry["created_at"],
        "updated_at": entry["updated_at"],
    }


async def create_entry(
    user_id: str,
    title: str,
    text: str,
):
    now = datetime.now(timezone.utc)

    entry = {
        "user_id": user_id,
        "title": title,
        "text": encrypt_text(text),
        "created_at": now,
        "updated_at": now,
    }

    result = await entries_collection.insert_one(entry)

    entry["_id"] = result.inserted_id

    return serialize_entry(entry)


async def get_user_entries(
    user_id: str, page: int = 1, limit: int = 9, search: str = ""
):
    skip = (page - 1) * limit
    query = {"user_id": user_id}

    if search.strip():
        term = search.strip()
        query["$or"] = [
            {"title": {"$regex": term, "$options": "i"}},
            {"text": {"$regex": term, "$options": "i"}},
        ]

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
