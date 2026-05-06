from sqlalchemy.orm import Session

from models.notification import notification



def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str,
    related_shift_id: int | None = None,
    related_application_id: int | None = None,
):
    new_notification = notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        related_shift_id=related_shift_id,
        related_application_id=related_application_id,
        is_read=False,
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    return new_notification


def get_user_notifications(db: Session, user_id: int):
    return (
        db.query(notification)
        .filter(notification.user_id == user_id)
        .order_by(notification.created_at.desc())
        .all()
    )


def get_unread_notification_count(db: Session, user_id: int):
    return (
        db.query(notification)
        .filter(notification.user_id == user_id, notification.is_read == False)
        .count()
    )


def mark_notification_as_read(db: Session, notification_obj: notification):
    notification_obj.is_read = True
    db.commit()
    db.refresh(notification_obj)
    return notification_obj


def mark_all_notifications_as_read(db: Session, user_id: int):
    notifications = (
        db.query(notification)
        .filter(notification.user_id == user_id, notification.is_read == False)
        .all()
    )

    for item in notifications:
        item.is_read = True

    db.commit()
    return True


def get_notification_by_id(db: Session, notification_id: int):
    return db.query(notification).filter(notification.id == notification_id).first()