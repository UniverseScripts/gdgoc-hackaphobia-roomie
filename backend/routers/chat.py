import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from typing import Annotated, List
from pydantic import BaseModel      
from datetime import datetime
from sqlalchemy import func, case, desc
from jose import jwt, JWTError
from starlette import status

from services.chat_manager import manager
from core.database import get_db, AsyncLocalSession
from services.chat_manager import manager
from models.message import Message
from models.user import User
from routers.auth import get_current_user, SECRET_KEY, ALGORITHM


router = APIRouter(prefix="/chat", tags=["Chat"])

class MessageSchema(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True
        
class ConversationSchema(BaseModel):
    partner_id: int
    partner_name: str
    partner_image: str | None = None
    last_message: str | None = None
    last_message_time: datetime | None = None
    unread_count: int = 0
    is_online: bool = False

@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Get all recent conversations with their last message and online status.
    """
    # 1. Subquery to find the latest message ID for each conversation pair
    # We group by the "other" person (partner)
    
    # Logic: Union of messages sent by me and messages sent to me
    # This is a bit complex in pure ORM, so we'll use a window function strategy or distinct on
    # For simplicity/speed in standard SQL:
    
    # Step 1: Find all unique partners I have exchanged messages with
    sent_stmt = select(Message.receiver_id.label("partner_id")).where(Message.sender_id == current_user.id)
    received_stmt = select(Message.sender_id.label("partner_id")).where(Message.receiver_id == current_user.id)
    
    partners_query = sent_stmt.union(received_stmt).subquery()
    
    # Step 2: Fetch User details for these partners
    partners_result = await db.execute(
        select(User).where(User.id.in_(select(partners_query)))
    )
    partners = partners_result.scalars().all()
    
    conversations = []
    
    for partner in partners:
        # Step 3: Get the very last message for this specific pair
        last_msg_query = select(Message).where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner.id),
                and_(Message.sender_id == partner.id, Message.receiver_id == current_user.id)
            )
        ).order_by(desc(Message.timestamp)).limit(1)
        
        last_msg_result = await db.execute(last_msg_query)
        last_msg = last_msg_result.scalars().first()
        
        # Step 4: Check Online Status from your ChatManager
        # manager.active_connections is Dict[int, List[WebSocket]]
        is_online = partner.id in manager.active_connections
        
        conversations.append(ConversationSchema(
            partner_id=partner.id,
            partner_name=partner.username, # Or partner.full_name
            partner_image=None, # Assuming this field exists
            last_message=last_msg.content if last_msg is not None else None,
            last_message_time=last_msg.timestamp if last_msg is not None else None,
            unread_count=0, # You can implement a read/unread flag logic later
            is_online=is_online
        ))
    
    # Sort by latest message time
    conversations.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)
    
    return conversations
# --- REST ENDPOINT: GET HISTORY ---

@router.get("/history/{partner_id}", response_model=List[MessageSchema])
async def get_chat_history(
    partner_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Fetch conversation history between Current User AND Partner.
    """
    # Logic: Select messages where (Sender=Me AND Receiver=You) OR (Sender=You AND Receiver=Me)
    query = select(Message).where(
        or_(
            and_(Message.sender_id == current_user.id,
                 Message.receiver_id == partner_id),
            and_(Message.sender_id == partner_id,
                 Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp.asc())

    result = await db.execute(query)
    messages = result.scalars().all()
    return messages

# --- WEBSOCKET ENDPOINT: REAL-TIME ---

@router.websocket("/ws/{user_id}/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str
):
    """
    Secured WebSocket Endpoint.
    """
    # 1. VALIDATE TOKEN BEFORE ACCEPTING
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_user_id = payload.get("id")
        
        if token_user_id is None or token_user_id != user_id:
            # Token is valid but belongs to a different user (Identity Theft attempt)
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
    except JWTError:
        # Token is invalid or expired
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Accept connection if valid
    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                receiver_id = int(message_data['to'])
                content = message_data['msg']
            except (json.JSONDecodeError, KeyError, ValueError):
                await websocket.send_json({"error": "Invalid message format"})
                continue

            # 3. Persist to Database
            try:
                async with AsyncLocalSession() as db:
                    new_msg = Message(sender_id=user_id,
                                      receiver_id=receiver_id, content=content)
                    db.add(new_msg)
                    await db.commit()
            except Exception as db_error:
                print(f"Database error: {db_error}")
                continue

            # 4. Route Message
            await manager.send_personal_message(
                json.dumps({"sender": user_id, "msg": content}),
                receiver_id
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)
