import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from bson import ObjectId

from app.schemas.vault import VaultKeySetup
from app.services.entry_service import get_user_entries
from app.services.sharing_service import add_collaborator


class CollaboratorNotificationTests(unittest.IsolatedAsyncioTestCase):
    def test_vault_key_schema_accepts_exported_public_jwk(self):
        result = VaultKeySetup.model_validate(
            {
                "public_key": {
                    "kty": "RSA",
                    "n": "modulus",
                    "e": "AQAB",
                    "alg": "RSA-OAEP-256",
                    "key_ops": ["encrypt"],
                    "ext": True,
                },
                "private_key": {"ciphertext": "encrypted", "iv": "1234567890123456"},
            }
        )

        self.assertEqual(result.public_key["key_ops"], ["encrypt"])
        self.assertIs(result.public_key["ext"], True)

    async def test_invite_creates_recipient_notification_without_key(self):
        owner_id = str(ObjectId())
        recipient_id = ObjectId()
        note_id = str(ObjectId())
        key_envelope = "encrypted-note-key-envelope"

        with (
            patch(
                "app.services.sharing_service.entries_collection.find_one",
                new=AsyncMock(return_value={"_id": ObjectId(note_id)}),
            ),
            patch(
                "app.services.sharing_service.users_collection.find_one",
                new=AsyncMock(
                    side_effect=[
                        {
                            "_id": recipient_id,
                            "email": "reader@example.com",
                            "name": "Reader",
                        },
                        {"name": "Author", "email": "author@example.com"},
                    ]
                ),
            ),
            patch(
                "app.services.sharing_service.note_collaborators_collection.update_one",
                new=AsyncMock(),
            ) as update_collaborator,
            patch(
                "app.services.sharing_service.notifications_collection.insert_one",
                new=AsyncMock(),
            ) as insert_notification,
        ):
            collaborator, reason = await add_collaborator(
                owner_id=owner_id,
                entry_id=note_id,
                email="reader@example.com",
                role="viewer",
                key_envelope=key_envelope,
            )

        self.assertIsNone(reason)
        self.assertEqual(collaborator["user_id"], str(recipient_id))
        collaborator_update = update_collaborator.await_args.args[1]["$set"]
        self.assertEqual(collaborator_update["key_envelope"], key_envelope)

        notification = insert_notification.await_args.args[0]
        self.assertEqual(notification["user_id"], str(recipient_id))
        self.assertEqual(notification["note_id"], ObjectId(note_id))
        self.assertEqual(notification["role"], "viewer")
        self.assertIsNone(notification["read_at"])
        self.assertNotIn("key_envelope", notification)

    async def test_collaborator_listing_uses_recipient_key_only(self):
        user_id = str(ObjectId())
        note_id = ObjectId()
        note = {
            "_id": note_id,
            "user_id": str(ObjectId()),
            "ciphertext": "encrypted-note",
            "iv": "123456789012",
            "wrapped_key": "owner-wrapped-key",
            "key_iv": "owner-key-iv",
            "created_at": None,
            "updated_at": None,
        }
        collaborator_cursor = MagicMock()
        collaborator_cursor.__aiter__.return_value = [
            {
                "note_id": note_id,
                "role": "viewer",
                "key_envelope": "recipient-key-envelope",
            }
        ]
        entry_cursor = MagicMock()
        entry_cursor.sort.return_value = entry_cursor
        entry_cursor.skip.return_value = entry_cursor
        entry_cursor.limit.return_value = entry_cursor
        entry_cursor.__aiter__.return_value = [note]

        with (
            patch(
                "app.services.entry_service.note_collaborators_collection.find",
                return_value=collaborator_cursor,
            ),
            patch(
                "app.services.entry_service.entries_collection.count_documents",
                new=AsyncMock(return_value=1),
            ),
            patch(
                "app.services.entry_service.entries_collection.find",
                return_value=entry_cursor,
            ),
        ):
            result = await get_user_entries(user_id)

        shared_note = result["items"][0]
        self.assertEqual(shared_note["role"], "viewer")
        self.assertEqual(
            shared_note["recipient_key_ciphertext"], "recipient-key-envelope"
        )
        self.assertNotIn("wrapped_key", shared_note)
        self.assertNotIn("key_iv", shared_note)

    async def test_owned_entry_listing_excludes_collaborator_notes(self):
        user_id = str(ObjectId())
        note = {
            "_id": ObjectId(),
            "user_id": user_id,
            "ciphertext": "encrypted-note",
            "iv": "encrypted-iv-12",
            "created_at": None,
            "updated_at": None,
        }
        entry_cursor = MagicMock()
        entry_cursor.sort.return_value = entry_cursor
        entry_cursor.skip.return_value = entry_cursor
        entry_cursor.limit.return_value = entry_cursor
        entry_cursor.__aiter__.return_value = [note]

        with (
            patch(
                "app.services.entry_service.note_collaborators_collection.find"
            ) as find_collaborators,
            patch(
                "app.services.entry_service.entries_collection.count_documents",
                new=AsyncMock(return_value=1),
            ) as count_entries,
            patch(
                "app.services.entry_service.entries_collection.find",
                return_value=entry_cursor,
            ) as find_entries,
        ):
            result = await get_user_entries(user_id, owned_only=True)

        find_collaborators.assert_not_called()
        count_entries.assert_awaited_once_with({"user_id": user_id})
        find_entries.assert_called_once_with({"user_id": user_id})
        self.assertEqual(len(result["items"]), 1)
        self.assertEqual(result["items"][0]["role"], "owner")


if __name__ == "__main__":
    unittest.main()
