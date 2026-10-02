from bson import ObjectId
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import decode_access_token
from app.services.entry_service import get_entry_by_id
from app.services.live_updates import note_update_hub

router = APIRouter()


@router.websocket("/api/entries/{entry_id}/live")
async def note_live_updates(websocket: WebSocket, entry_id: str):
    access_token = websocket.cookies.get("access_token")
    if not access_token or not ObjectId.is_valid(entry_id):
        await websocket.close(code=4401)
        return

    try:
        payload = decode_access_token(access_token)
        user_id = payload.get("sub")
        if payload.get("type") != "access" or not user_id:
            await websocket.close(code=4401)
            return
        entry = await get_entry_by_id(user_id, entry_id)
    except Exception:
        await websocket.close(code=4401)
        return

    if not entry:
        await websocket.close(code=4404)
        return

    await note_update_hub.connect(entry_id, websocket)
    try:
        while True:
            message = await websocket.receive_text()
            if message == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        note_update_hub.disconnect(entry_id, websocket)
