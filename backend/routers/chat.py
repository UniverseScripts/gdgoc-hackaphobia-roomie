import json
from pydantic import BaseModel
from datetime import datetime, timezone
from google.cloud import firestore
from firebase_admin import auth as firebase_auth
from google.cloud.firestore_v1.base_query import FieldFilter, Or
from typing import Annotated, Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from starlette import status
from services.chat_manager import manager
from core.config import db
from services.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_thread_id(user1: str, user2: str) -> str:
    return "_".join(sorted([user1, user2]))

class MessageSchema(BaseModel):
    id: str
    thread_id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime

class ConversationSchema(BaseModel):
    id: str # Partner UID
    name: str
    avatar: str | None = None
    lastMessage: str | None = None
    last_activity: datetime | None = None
    unread: int = 0
    online: bool = False

@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(current_user: Annotated[dict, Depends(get_current_user)]):
    current_uid = current_user['id']
    
    # Find all messages where user is sender OR receiver
    filter_1 = FieldFilter("sender_id", "==", current_uid)
    filter_2 = FieldFilter("receiver_id", "==", current_uid)
    or_filter = Or(filters=[filter_1, filter_2])
    
    # Fetch messages without OrderBy to avoid requiring composite indexes
    messages_stream = db.collection('messages').where(filter=or_filter).stream()
    
    conversations_map: Dict[str, dict] = {}
    
    # Aggregate to find partners and latest messages in memory
    for msg_doc in messages_stream:
        msg = msg_doc.to_dict()
        partner_id = msg['receiver_id'] if msg['sender_id'] == current_uid else msg['sender_id']
        
        msg_time = msg.get('timestamp')
        existing_time = conversations_map.get(partner_id, {}).get('last_message_time')
        
        # Only update the map if this message is newer than what we've already found for this partner
        if not existing_time or (msg_time and msg_time > existing_time):
            conversations_map[partner_id] = {
                "last_message": msg.get('content'),
                "last_message_time": msg_time
            }

    conversations = []
    
    # Fetch partner details
    for partner_id, data in conversations_map.items():
        partner_doc = db.collection('users').document(partner_id).get()
        if not partner_doc.exists:
            continue
            
        partner_data = partner_doc.to_dict()
        is_online = partner_id in manager.active_connections
        
        conversations.append(ConversationSchema(
            id=partner_id,
            name=partner_data.get('username', 'Unknown'),
            avatar=partner_data.get('avatar_url'), # Map avatar_url to avatar
            lastMessage=data['last_message'],
            last_activity=data['last_message_time'],
            unread=0, 
            online=is_online
        ))
    
    conversations.sort(key=lambda x: x.last_activity or datetime.min, reverse=True)
    return conversations

@router.get("/history/{partner_id}", response_model=List[MessageSchema])
async def get_chat_history(
    partner_id: str, 
    limit: int = 50, 
    start_after_timestamp: str = None, 
    current_user: dict = Depends(get_current_user)
):
    current_uid = current_user['id']
    thread_id = get_thread_id(current_uid, partner_id)
    
    # Fetch all messages for this thread to avoid composite index requirements
    query = db.collection("messages").where(
        filter=FieldFilter("thread_id", "==", thread_id)
    )
    
    # Accumulate results and sort in Python
    results = [doc.to_dict() | {'id': doc.id} for doc in query.stream()]
    
    # Sort descending by timestamp, then apply limit
    results.sort(key=lambda x: x.get('timestamp') or datetime.min, reverse=True)
    results = results[:limit]
    
    # Reverse to maintain chronological order for the frontend
    results.reverse()
    return results

@router.get("/partner/{partner_id}")
async def get_partner_info(partner_id: str, current_user: Annotated[dict, Depends(get_current_user)]):
    """
    Fetches minimal partner info for bootstrapping a chat window.
    """
    partner_doc = db.collection('users').document(partner_id).get()
    if not partner_doc.exists:
        raise HTTPException(status_code=404, detail="Partner not found")
        
    p_data = partner_doc.to_dict()
    return {
        "id": partner_id,
        "name": p_data.get('username') or p_data.get('full_name') or "User",
        "avatar": p_data.get('avatar_url')
    }

@router.websocket("/ws/{user_id}/{token}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str):
    try:
        # Standard Firebase token verification
        decoded_token = firebase_auth.verify_id_token(token)
        token_uid = decoded_token.get("uid")
        
        if token_uid is None or token_uid != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception as e:
        print(f"WebSocket Auth Failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                receiver_id = message_data['to']
                content = message_data['msg']
            except (json.JSONDecodeError, KeyError, ValueError):
                await websocket.send_json({"error": "Invalid message format"})
                continue

            try:
                new_msg = {
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "timestamp": datetime.now(timezone.utc),
                    "thread_id": get_thread_id(user_id, receiver_id)
                }
                # Capture the return value to get the document ID
                _, doc_ref = db.collection('messages').add(new_msg)
                new_msg_id = doc_ref.id
            except Exception as db_error:
                print(f"Database error: {db_error}")
                continue

            msg_payload = json.dumps({
                "id": new_msg_id,
                "sender": user_id, 
                "msg": content
            })

            await manager.send_personal_message(msg_payload, receiver_id)
            # Echo back to sender for other tabs and confirmation
            await manager.send_personal_message(msg_payload, user_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)