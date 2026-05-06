from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from Database import get_db
from Routers.auth import get_current_user

from schemas import ShiftApplicationCreate, ShiftApplicationResponse, WorkerApplicationDetailedResponse, ShiftApplicantDetailedResponse
from Logic.profile_logic import get_worker_profile

from Logic.shift_logic import get_shift_by_id

from Logic.application_logic import get_application_by_shift_and_worker, create_application,get_applications_for_shift,get_applications_by_worker,get_application_by_id, approve_application,confirm_application,decline_application,reject_application,withdraw_application, get_shift_applicants_detailed,get_worker_applications_detailed
from Logic.notification_logic import create_notification
router = APIRouter()

@router.post("/{shift_id}", response_model=ShiftApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_shift(
    shift_id : int,
    application_data : ShiftApplicationCreate,
    db : Session = Depends(get_db),
    current_user = Depends(get_current_user), 
   ):
    
    if(current_user.role != "worker"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can apply to shifts"
        )
    
    worker_profile = get_worker_profile(db,current_user.id)

    if not worker_profile: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile must exist before applying"
        )

    shift =  get_shift_by_id(db, shift_id)

    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    if shift.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This shift is not open for applications"
        )
    
    existing_application = get_application_by_shift_and_worker(db, shift_id, current_user.id)

    if(existing_application):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "You have already applied to this shift"
        )
    
    new_application = create_application(db, shift_id, current_user.id, application_data)

    create_notification(
        db=db,
        user_id=shift.client_id,
        title="New shift application",
        message=f"A worker has applied to your shift: {shift.title}",
        type="application_created",
        related_shift_id=shift.id,
        related_application_id=new_application.id,
    )
    
    return new_application


@router.get("/my", response_model=list[WorkerApplicationDetailedResponse])
def get_my_applications_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can view their applications"
        )

    return get_worker_applications_detailed(db, current_user.id)


@router.get("/shift/{shift_id}", response_model=list[ShiftApplicantDetailedResponse])
def get_shift_applications_route(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    shift_obj = get_shift_by_id(db, shift_id)
    if not shift_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can view applications for a shift"
        )

    if shift_obj.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view applications for your own shifts"
        )

    return get_shift_applicants_detailed(db, shift_id)

@router.post("/{application_id}/approve", response_model=ShiftApplicationResponse)
def approve_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can approve applications"
        )

    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    shift = get_shift_by_id(db, application.shift_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only approve applications for your own shifts"
        )

    if application.status != "applied":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only applied applications can be approved"
        )

    if shift.status not in ["open", "pending_confirmation"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This shift is not accepting approvals right now"
        )
    
    result = approve_application(db, application, shift)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Shift is already full. No more approvals allowed."
        )
    
    create_notification(
        db=db,
        user_id=application.worker_id,
        title="Application approved",
        message=f"Your application for '{shift.title}' has been approved.",
        type="application_approved",
        related_shift_id=shift.id,
        related_application_id=application.id,
    )

    return result


@router.post("/{application_id}/confirm", response_model=ShiftApplicationResponse)
def confirm_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can confirm applications"
        )

    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only confirm your own application"
        )

    if application.status != "client_approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved applications can be confirmed"
        )

    shift = get_shift_by_id(db, application.shift_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    result, became_expired = confirm_application(db, application, shift)

    if became_expired:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Seats are full now. You got a bit late. Your application has expired."
        )
    

    create_notification(
        db=db,
        user_id=shift.client_id,
        title="Worker confirmed shift",
        message=f"A worker confirmed participation for '{shift.title}'.",
        type="shift_confirmed",
        related_shift_id=shift.id,
        related_application_id=application.id,
    )   

    return result


@router.post("/{application_id}/decline", response_model=ShiftApplicationResponse)
def decline_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can decline applications"
        )

    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only decline your own application"
        )

    if application.status != "client_approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only approved applications can be declined"
        )

    shift = get_shift_by_id(db, application.shift_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )
    
    result = decline_application(db, application, shift)
    

    create_notification(
        db=db,
        user_id=shift.client_id,
        title="Worker declined shift",
        message=f"A worker declined the approved shift '{shift.title}'.",
        type="shift_declined",
        related_shift_id=shift.id,
        related_application_id=application.id,
    )

    return result



@router.post("/{application_id}/reject", response_model=ShiftApplicationResponse)
def reject_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can reject applications"
        )

    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    shift = get_shift_by_id(db, application.shift_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    if shift.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject applications for your own shifts"
        )

    if application.status not in ["applied", "client_approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only applied or approved applications can be rejected"
        )
    
    result = reject_application(db, application, shift)

    create_notification(
        db=db,
        user_id=application.worker_id,
        title="Application rejected",
        message=f"Your application for '{shift.title}' has been rejected.",
        type="application_rejected",
        related_shift_id=shift.id,
        related_application_id=application.id,
    )

    return result 

@router.post("/{application_id}/withdraw", response_model=ShiftApplicationResponse)
def withdraw_application_route(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can withdraw applications"
        )

    application = get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.worker_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only withdraw your own application"
        )

    if application.status not in ["applied", "client_approved"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only applied or approved applications can be withdrawn"
        )

    shift = get_shift_by_id(db, application.shift_id)
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shift not found"
        )

    return withdraw_application(db, application, shift)

