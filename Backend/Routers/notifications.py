from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from Database import get_db
from Routers.auth import get_current_user
from schemas import NotificationResponse, NotificationUnreadCountResponse
from Logic.notification_logic import (
    get_user_notifications,
    get_unread_notification_count,
    get_notification_by_id,
    mark_notification_as_read,
    mark_all_notifications_as_read,
)

router = APIRouter()

@router.get("", response_model=list[NotificationResponse])
def get_notification_route(db:Session=Depends(get_db), current_user = Depends(get_current_user)):
    return get_user_notifications(db, current_user.id)

@router.get("/unread-count", response_model=NotificationUnreadCountResponse)
def get_unread_notification_count_route(db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    unread_count = get_unread_notification_count(db, current_user.id)
    return {"unread_count": unread_count}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read_route(notification_id: int,db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    notification_obj = get_notification_by_id(db, notification_id)

    if not notification_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if notification_obj.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own notifications"
        )

    return mark_notification_as_read(db, notification_obj)


@router.post("/read-all")
def mark_all_notifications_read_route(db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    mark_all_notifications_as_read(db, current_user.id)
    return {"detail": "All notifications marked as read"}