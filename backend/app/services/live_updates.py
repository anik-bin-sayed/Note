from fastapi import WebSocket


class NoteUpdateHub:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {}

    async def connect(self, note_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(note_id, set()).add(websocket)

    def disconnect(self, note_id: str, websocket: WebSocket):
        connections = self.connections.get(note_id)
        if not connections:
            return
        connections.discard(websocket)
        if not connections:
            self.connections.pop(note_id, None)

    async def broadcast(self, note_id: str, event: dict):
        connections = tuple(self.connections.get(note_id, ()))
        for websocket in connections:
            try:
                await websocket.send_json(event)
            except Exception:
                self.disconnect(note_id, websocket)


note_update_hub = NoteUpdateHub()
