import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Annotated, List, Dict
from pydantic import BaseModel      
from datetime import datetime
from jose import jwt, JWTError
from starlette import status
from google.cloud.firestore_v1.base_query import FieldFilter, Or
from google.cloud import firestore

from services.chat_manager import manager
from core.config import db
from routers.auth import get_current_user, SECRET_KEY, ALGORITHM

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
    partner_id: str
    partner_name: str
    partner_image: str | None = None
    last_message: str | None = None
    last_message_time: datetime | None = None
    unread_count: int = 0
    is_online: bool = False

@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(current_user: Annotated[dict, Depends(get_current_user)]):
    current_uid = current_user['id']
    
    # Find all messages where user is sender OR receiver
    filter_1 = FieldFilter("sender_id", "==", current_uid)
    filter_2 = FieldFilter("receiver_id", "==", current_uid)
    or_filter = Or(filters=[filter_1, filter_2])
    
    messages_stream = db.collection('messages').where(filter=or_filter).order_by("timestamp").stream()
    
    conversations_map: Dict[str, dict] = {}
    
    # Aggregate to find partners and latest messages
    for msg_doc in messages_stream:
        msg = msg_doc.to_dict()
        partner_id = msg['receiver_id'] if msg['sender_id'] == current_uid else msg['sender_id']
        
        # Because we ordered by timestamp, the last one we see will be the latest
        conversations_map[partner_id] = {
            "last_message": msg.get('content'),
            "last_message_time": msg.get('timestamp')
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
            partner_id=partner_id,
            partner_name=partner_data.get('username', 'Unknown'),
            partner_image=None, 
            last_message=data['last_message'],
            last_message_time=data['last_message_time'],
            unread_count=0, 
            is_online=is_online
        ))
    
    conversations.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)
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
    
    query = db.collection("messages").where(
        filter=FieldFilter("thread_id", "==", thread_id)
    ).order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit)
    
    if start_after_timestamp:
        # Note: Depending on the timestamp structure, it might need casting to datetime object.
        query = query.start_after({
            "timestamp": start_after_timestamp
        })
        
    results = [doc.to_dict() | {'id': doc.id} for doc in query.stream()]
    # Reverse to maintain chronological order (oldest to newest) for frontend rendering
    results.reverse()
    return results

@router.websocket("/ws/{user_id}/{token}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_user_id = payload.get("id")
        
        if token_user_id is None or token_user_id != user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except JWTError:
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
                db.collection('messages').add(new_msg)
            except Exception as db_error:
                print(f"Database error: {db_error}")
                continue

            await manager.send_personal_message(
                json.dumps({"sender": user_id, "msg": content}),
                receiver_id
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)