from datetime import datetime, timezone

from bson import ObjectId
from pymongo import ReturnDocument

from app.database import (
    entries_collection,
    note_collaborators_collection,
    shared_notes_collection,
)
from app.services.encryption import (
    decrypt_text,
    encrypt_text,
)


def serialize_entry(entry: dict, role: str = "owner") -> dict:
    serialized = {
        "id": str(entry["_id"]),
        "user_id": entry["user_id"],
        "created_at": entry["created_at"],
        "updated_at": entry["updated_at"],
        "role": role,
        "revision": entry.get("revision", 0),
    }

    if "ciphertext" in entry:
        serialized.update(
            {
                "ciphertext": entry["ciphertext"],
                "iv": entry["iv"],
            }
        )
        if "wrapped_key" in entry and "key_iv" in entry:
            serialized.update(
                {
                    "wrapped_key": entry["wrapped_key"],
                    "key_iv": entry["key_iv"],
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
    wrapped_key: str | None = None,
    key_iv: str | None = None,
):
    now = datetime.now(timezone.utc)

    entry = {
        "user_id": user_id,
        "ciphertext": ciphertext,
        "iv": iv,
        "created_at": now,
        "updated_at": now,
        "revision": 1,
    }
    if wrapped_key is not None and key_iv is not None:
        entry.update({"wrapped_key": wrapped_key, "key_iv": key_iv})

    result = await entries_collection.insert_one(entry)

    entry["_id"] = result.inserted_id

    return serialize_entry(entry)


async def get_user_entries(user_id: str, page: int = 1, limit: int = 9):
    skip = (page - 1) * limit
    collaborator_cursor = note_collaborators_collection.find({"user_id": user_id})
    collaborators = [collaborator async for collaborator in collaborator_cursor]
    collaborators_by_note = {
        str(collaborator["note_id"]): collaborator for collaborator in collaborators
    }
    query = {"user_id": user_id}
    if collaborators:
        query = {
            "$or": [
                {"user_id": user_id},
                {"_id": {"$in": [item["note_id"] for item in collaborators]}},
            ]
        }

    total = await entries_collection.count_documents(query)

    cursor = (
        entries_collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)
    )

    entries = []

    async for entry in cursor:
        collaborator = collaborators_by_note.get(str(entry["_id"]))
        if entry["user_id"] == user_id or not collaborator:
            entries.append(serialize_entry(entry))
            continue

        serialized = serialize_entry(entry, collaborator["role"])
        serialized.pop("wrapped_key", None)
        serialized.pop("key_iv", None)
        serialized["recipient_key_ciphertext"] = collaborator.get("key_envelope")
        entries.append(serialized)

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

    entry = await entries_collection.find_one({"_id": ObjectId(entry_id)})

    if not entry:
        return None

    if entry["user_id"] == user_id:
        return serialize_entry(entry)

    collaborator = await note_collaborators_collection.find_one(
        {"note_id": ObjectId(entry_id), "user_id": user_id}
    )
    if not collaborator:
        return None

    serialized = serialize_entry(entry, collaborator["role"])
    serialized.pop("wrapped_key", None)
    serialized.pop("key_iv", None)
    if collaborator.get("key_envelope"):
        serialized["recipient_key_ciphertext"] = collaborator["key_envelope"]
    return serialized


async def delete_entry(user_id: str, entry_id: str):
    if not ObjectId.is_valid(entry_id):
        return False

    result = await entries_collection.delete_one(
        {
            "_id": ObjectId(entry_id),
            "user_id": user_id,
        }
    )

    if result.deleted_count == 1:
        await note_collaborators_collection.delete_many({"note_id": ObjectId(entry_id)})
        await shared_notes_collection.delete_many({"note_id": ObjectId(entry_id)})

    return result.deleted_count == 1


async def update_entry(
    user_id: str,
    entry_id: str,
    ciphertext: str,
    iv: str,
    wrapped_key: str | None = None,
    key_iv: str | None = None,
):
    if not ObjectId.is_valid(entry_id):
        return None

    current = await get_entry_by_id(user_id, entry_id)
    if not current:
        return None
    if current["role"] == "viewer":
        raise PermissionError("Viewer access cannot update notes")

    now = datetime.now(timezone.utc)
    update_fields = {
        "ciphertext": ciphertext,
        "iv": iv,
        "updated_at": now,
    }
    if current["role"] == "owner" and wrapped_key is not None and key_iv is not None:
        update_fields.update({"wrapped_key": wrapped_key, "key_iv": key_iv})

    entry = await entries_collection.find_one_and_update(
        {
            "_id": ObjectId(entry_id),
        },
        {
            "$set": update_fields,
            "$inc": {"revision": 1},
            "$unset": {
                "title": "",
                "text": "",
            },
        },
        return_document=ReturnDocument.AFTER,
    )

    if not entry:
        return None

    serialized = serialize_entry(entry, current["role"])
    if current["role"] != "owner":
        serialized.pop("wrapped_key", None)
        serialized.pop("key_iv", None)
        serialized["recipient_key_ciphertext"] = current.get("recipient_key_ciphertext")
    return serialized
