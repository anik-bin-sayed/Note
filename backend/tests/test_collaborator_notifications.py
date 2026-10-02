import unittest
from unittest.mock import AsyncMock, patch

from bson import ObjectId

from app.services.sharing_service import add_collaborator


class CollaboratorNotificationTests(unittest.IsolatedAsyncioTestCase):
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


if __name__ == "__main__":
    unittest.main()
