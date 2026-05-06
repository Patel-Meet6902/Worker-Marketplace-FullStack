from sqlalchemy.orm import Session

from models.conversation import conversation
from models.message import message
from models.shifts import shift
from models.shiftapplications import shiftapplication
from models.user import User
from models.workers import workerprofile
from models.clients import clientprofile


ACTIVE_CHAT_APPLICATION_STATUSES = ["applied", "client_approved", "worker_confirmed"]


def get_shift_by_id(db: Session, shift_id: int):
    return db.query(shift).filter(shift.id == shift_id).first()


def get_active_application_for_shift_worker(db: Session, shift_id: int, worker_id: int):
    return (
        db.query(shiftapplication)
        .filter(
            shiftapplication.shift_id == shift_id,
            shiftapplication.worker_id == worker_id,
            shiftapplication.status.in_(ACTIVE_CHAT_APPLICATION_STATUSES),
        )
        .first()
    )


def get_conversation_by_participants(db: Session, shift_id: int, client_id: int, worker_id: int):
    return (
        db.query(conversation)
        .filter(
            conversation.shift_id == shift_id,
            conversation.client_id == client_id,
            conversation.worker_id == worker_id,
        )
        .first()
    )


def create_conversation(db: Session, shift_id: int, client_id: int, worker_id: int):
    new_conversation = conversation(
        shift_id=shift_id,
        client_id=client_id,
        worker_id=worker_id,
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return new_conversation


def get_or_create_conversation(db: Session, shift_id: int, client_id: int, worker_id: int):
    existing = get_conversation_by_participants(db, shift_id, client_id, worker_id)
    if existing:
        return existing
    return create_conversation(db, shift_id, client_id, worker_id)


def get_user_display_name(db: Session, user_id: int, role: str):
    if role == "worker":
        worker_profile = db.query(workerprofile).filter(workerprofile.User_id == user_id).first()
        if worker_profile and worker_profile.full_name:
            return worker_profile.full_name

    if role == "client":
        client_profile = db.query(clientprofile).filter(clientprofile.User_id == user_id).first()
        if client_profile:
            if client_profile.contact_name:
                return client_profile.contact_name
            if client_profile.company_name:
                return client_profile.company_name

    user_obj = db.query(User).filter(User.id == user_id).first()
    return user_obj.username if user_obj else "User"


def build_conversation_response(db: Session, convo: conversation, current_user_id: int):
    shift_obj = db.query(shift).filter(shift.id == convo.shift_id).first()

    if current_user_id == convo.client_id:
        other_user_id = convo.worker_id
        other_user_role = "worker"
    else:
        other_user_id = convo.client_id
        other_user_role = "client"

    other_user_name = get_user_display_name(db, other_user_id, other_user_role)

    last_message_obj = (
        db.query(message)
        .filter(message.conversation_id == convo.id)
        .order_by(message.created_at.desc())
        .first()
    )

    unread_count = (
        db.query(message)
        .filter(
            message.conversation_id == convo.id,
            message.sender_id != current_user_id,
            message.is_read == False,
        )
        .count()
    )

    return {
        "id": convo.id,
        "shift_id": convo.shift_id,
        "shift_title": shift_obj.title if shift_obj else "Shift",
        "other_user_id": other_user_id,
        "other_user_name": other_user_name,
        "last_message": last_message_obj.content if last_message_obj else None,
        "last_message_at": last_message_obj.created_at if last_message_obj else None,
        "unread_count": unread_count,
        "created_at": convo.created_at,
    }


def get_user_conversations(db: Session, user_id: int):
    conversations = (
        db.query(conversation)
        .filter(
            (conversation.client_id == user_id) |
            (conversation.worker_id == user_id)
        )
        .order_by(conversation.created_at.desc())
        .all()
    )

    return [build_conversation_response(db, convo, user_id) for convo in conversations]


def get_conversation_for_user(db: Session, conversation_id: int, user_id: int):
    return (
        db.query(conversation)
        .filter(
            conversation.id == conversation_id,
            ((conversation.client_id == user_id) | (conversation.worker_id == user_id))
        )
        .first()
    )


def get_conversation_messages(db: Session, convo: conversation, current_user_id: int):
    if current_user_id == convo.client_id:
        client_name = get_user_display_name(db, convo.client_id, "client")
        worker_name = get_user_display_name(db, convo.worker_id, "worker")
    else:
        client_name = get_user_display_name(db, convo.client_id, "client")
        worker_name = get_user_display_name(db, convo.worker_id, "worker")

    unread_messages = (
        db.query(message)
        .filter(
            message.conversation_id == convo.id,
            message.sender_id != current_user_id,
            message.is_read == False,
        )
        .all()
    )

    for msg in unread_messages:
        msg.is_read = True

    if unread_messages:
        db.commit()

    messages = (
        db.query(message)
        .filter(message.conversation_id == convo.id)
        .order_by(message.created_at.asc())
        .all()
    )

    response = []
    for msg in messages:
        sender_name = client_name if msg.sender_id == convo.client_id else worker_name

        response.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_name": sender_name,
            "content": msg.content,
            "is_read": msg.is_read,
            "created_at": msg.created_at,
        })

    return response


def send_message_to_conversation(db: Session, conversation_id: int, sender_id: int, content: str):
    new_message = message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content.strip(),
        is_read=False,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message