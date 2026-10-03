import unittest

from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import app


class LiveUpdateAuthorizationTests(unittest.TestCase):
    def test_websocket_rejects_missing_access_cookie(self):
        client = TestClient(app)

        with self.assertRaises(WebSocketDisconnect) as error:
            with client.websocket_connect("/api/entries/000000000000000000000001/live"):
                self.fail("Unauthenticated WebSocket connection was accepted")

        self.assertEqual(error.exception.code, 4401)


if __name__ == "__main__":
    unittest.main()
