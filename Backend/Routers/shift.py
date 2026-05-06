from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Literal
from datetime import date
from decimal import Decimal
from Database import get_db
from Routers.auth import get_current_user
from schemas import ShiftCreate, ShiftUpdate, ShiftResponse, ClientShiftItemResponse
from Logic.shift_logic import (
    create_shift,
    get_all_shifts,
    get_shift_by_id,
    update_shift,
    delete_shift,
    cancel_shift,
    complete_shift,
    get_my_client_shifts
)

from Logic.notification_logic import create_notification

from models.shiftapplications import shiftapplication


router = APIRouter()

@router.post("", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift_route(
    shift_data: ShiftCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create shifts"
        )

    return create_shift(db, current_user.id, shift_data)

@router.get("", response_model=list[ShiftResponse])
def get_shifts_route(
    location : str | None = Query(default=None, max_length=255),
    shift_status: Literal["open", "pending_confirmation", "assigned", "completed", "cancelled"] | None = None,
    shift_date: date | None = None,
    min_pay: Decimal | None = Query(default=None, ge=0),
    max_pay: Decimal | None = Query(default=None, ge=0),
    sort_by: Literal["created_at", "shift_date", "pay_rate"] = "created_at",
    sort_order: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db)
    ):

    if min_pay is not None and max_pay is not None and min_pay > max_pay:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_pay cannot be greater than max_pay"
        )

    return get_all_shifts(db,location,shift_status,shift_date,min_pay,max_pay,sort_by,sort_order)


@router.get("/my", response_model=list[ClientShiftItemResponse])
def get_my_shifts_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can view their own shifts"
        )

    return get_my_client_shifts(db, current_user.id)


@router.get("/{shift_id}", response_model=ShiftResponse)
def get_single_shift_route(shift_id: int, db: Session = Depends(get_db)):
    shift = get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    return shift


@router.put("/{shift_id}", response_model=ShiftResponse)
def update_shift_route(
    shift_id: int,
    shift_data: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shift = get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can update shifts"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own shifts"
        )

    return update_shift(db, shift, shift_data)


@router.delete("/{shift_id}")
def delete_shift_route(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shift = get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can delete shifts"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own shifts"
        )

    delete_shift(db, shift)
    return {"detail": "Shift deleted successfully"}


@router.post("/{shift_id}/cancel", response_model=ShiftResponse)
def cancel_shift_route(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shift = get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can cancel shifts"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own shifts"
        )

    if shift.status in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This shift cannot be cancelled"
        )

    result = cancel_shift(db, shift)

    applications = (
        db.query(shiftapplication)
        .filter(shiftapplication.shift_id == shift.id)
        .all()
    )

    for app in applications:
        create_notification(
            db=db,
            user_id=app.worker_id,
            title="Shift cancelled",
            message=f"The shift '{shift.title}' has been cancelled.",
            type="shift_cancelled",
            related_shift_id=shift.id,
            related_application_id=app.id,
        )

    return result 


@router.post("/{shift_id}/complete", response_model=ShiftResponse)
def complete_shift_route(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shift = get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can complete shifts"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only complete your own shifts"
        )

    if shift.status != "assigned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only assigned shifts can be marked as completed"
        )

    return complete_shift(db, shift)
