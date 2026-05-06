from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from Database import get_db
from Routers.auth import get_current_user
from schemas import ChatConversationResponse, ChatMessageCreate, ChatMessageResponse
from Logic.chat_logic import (
    get_shift_by_id,
    get_active_application_for_shift_worker,
    get_or_create_conversation,
    get_user_conversations,
    get_conversation_for_user,
    get_conversation_messages,
    send_message_to_conversation,
    build_conversation_response,
    get_user_display_name
)
from Logic.notification_logic import create_notification

from websocketManager import manager
from security import get_user_from_raw_token


router = APIRouter()


@router.post("/start/{shift_id}/{worker_id}", response_model=ChatConversationResponse)
def start_chat_route(
    shift_id: int,
    worker_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    shift_obj = get_shift_by_id(db, shift_id)

    if not shift_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    application = get_active_application_for_shift_worker(db, shift_id, worker_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat is only allowed for active shift applications"
        )

    if current_user.role == "client":
        if shift_obj.client_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only start chat for your own shifts"
            )

        client_id = current_user.id

    elif current_user.role == "worker":
        if current_user.id != worker_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Workers can only start chat for themselves"
            )

        client_id = shift_obj.client_id

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role"
        )

    convo = get_or_create_conversation(db, shift_id, client_id, worker_id)
    return build_conversation_response(db, convo, current_user.id)


@router.get("/conversations", response_model=list[ChatConversationResponse])
def get_my_conversations_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}", response_model=ChatConversationResponse)
def get_single_conversation_route(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    convo = get_conversation_for_user(db, conversation_id, current_user.id)

    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return build_conversation_response(db, convo, current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=list[ChatMessageResponse])
def get_messages_route(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    convo = get_conversation_for_user(db, conversation_id, current_user.id)

    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return get_conversation_messages(db, convo, current_user.id)


@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessageResponse)
def send_message_route(
    conversation_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    convo = get_conversation_for_user(db, conversation_id, current_user.id)

    if not convo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    content = message_data.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    msg = send_message_to_conversation(db, conversation_id, current_user.id, content)

    recipient_id = convo.worker_id if current_user.id == convo.client_id else convo.client_id

    shift_obj = get_shift_by_id(db, convo.shift_id)
    create_notification(
        db=db,
        user_id=recipient_id,
        title="New chat message",
        message=f"You received a new message about shift '{shift_obj.title}'.",
        type="chat_message",
        related_shift_id=convo.shift_id,
    )

    sender_name = current_user.username

    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "sender_name": sender_name,
        "content": msg.content,
        "is_read": msg.is_read,
        "created_at": msg.created_at,
    }


@router.websocket("/ws/chat/{conversation_id}")
async def websocket_chat_route(
    websocket: WebSocket,
    conversation_id: int,
    db: Session = Depends(get_db),
):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    current_user = get_user_from_raw_token(db, token)

    if not current_user:
        await websocket.close(code=1008)
        return

    convo = get_conversation_for_user(db, conversation_id, current_user.id)

    if not convo:
        await websocket.close(code=1008)
        return

    await manager.connect(conversation_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content", "").strip()

            if not content:
                continue

            msg = send_message_to_conversation(
                db=db,
                conversation_id=conversation_id,
                sender_id=current_user.id,
                content=content,
            )

            sender_role = "client" if current_user.id == convo.client_id else "worker"
            sender_name = get_user_display_name(db, current_user.id, sender_role)

            payload = {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "sender_name": sender_name,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at.isoformat(),
            }

            recipient_id = convo.worker_id if current_user.id == convo.client_id else convo.client_id
            shift_obj = get_shift_by_id(db, convo.shift_id)

            create_notification(
                db=db,
                user_id=recipient_id,
                title="New chat message",
                message=f"You received a new message about shift '{shift_obj.title}'.",
                type="chat_message",
                related_shift_id=convo.shift_id,
            )

            await manager.broadcast(conversation_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)