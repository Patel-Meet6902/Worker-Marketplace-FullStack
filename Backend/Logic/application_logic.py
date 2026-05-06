from sqlalchemy.orm import Session
from models.shiftapplications import shiftapplication
from models.shifts import shift
from models.workers import workerprofile

from datetime import datetime, timezone

def get_application_by_shift_and_worker(db:Session, shift_id:int, worker_id:int):
    return db.query(shiftapplication).filter(shiftapplication.shift_id == shift_id, shiftapplication.worker_id==worker_id).first()

def create_application(db:Session, shift_id:int, worker_id:int, application_data:str|None = None):
    new_application = shiftapplication(
        shift_id=shift_id,
        worker_id=worker_id,
        message=application_data.message,
        status="applied"
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application

def get_applications_for_shift(db:Session, shift_id:int):
    return db.query(shiftapplication).filter(shiftapplication.shift_id == shift_id).order_by(shiftapplication.applied_at.desc()).all()

def get_applications_by_worker(db:Session, user_id:int):
    return db.query(shiftapplication).filter(shiftapplication.worker_id==user_id).order_by(shiftapplication.applied_at.desc()).all()

def get_application_by_id(db:Session, application_id):
    return db.query(shiftapplication).filter(shiftapplication.id == application_id).first()

def get_confirm_count_for_shift(db:Session, shift_id:int):
    return  db.query(shiftapplication).filter(
        shiftapplication.shift_id == shift_id,
        shiftapplication.status == "worker_confirmed"
    ).count()


def expire_remaining_approved_applications(db:Session, shift_id:int, exclude_application_id:int|None = None):
    query = db.query(shiftapplication).filter(
        shiftapplication.shift_id == shift_id,
        shiftapplication.status == "client_approved"
    )

    if exclude_application_id is not None:
        query = query.filter(shiftapplication.id != exclude_application_id)

    remaining_applications = query.all()

    for app in remaining_applications:
        app.status = "expired"

    return remaining_applications

def approve_application(db:Session, application:shiftapplication, shift:shift):

    confirm_count = get_confirm_count_for_shift(db,shift.id)
    print(confirm_count)

    if(confirm_count >= shift.workers_needed):
        return None

    application.status = "client_approved"
    application.client_approved_at = datetime.now(timezone.utc)

    shift.status = "pending_confirmation"

    db.commit()
    db.refresh(application)
    db.refresh(shift)

    return application

def confirm_application(db:Session, application:shiftapplication, shift:shift):

    confirm_count = get_confirm_count_for_shift(db, shift.id)

    # seats already full before this worker confirms
    if confirm_count >= shift.workers_needed:
        application.status = "expired"
        application.worker_responded_at = datetime.now(timezone.utc)
        shift.status = "assigned"

        db.commit()
        db.refresh(application)
        return application, True

    application.status = "worker_confirmed"
    application.worker_responded_at = datetime.now(timezone.utc)

    # this worker is now taking one seat
    new_confirmed_count = confirm_count + 1

    if new_confirmed_count >= shift.workers_needed:
        shift.status = "assigned"

        # expire all other approved applications because seats are now full
        expire_remaining_approved_applications(db, shift.id, exclude_application_id=application.id)

    else:
        shift.status = "pending_confirmation"

    db.commit()
    db.refresh(application)
    return application, False


def get_pending_approved_count_for_shift(db: Session, shift_id: int):
    return db.query(shiftapplication).filter(
        shiftapplication.shift_id == shift_id,
        shiftapplication.status == "client_approved"
    ).count()

def decline_application(db: Session, application: shiftapplication, shift: shift):
    application.status = "worker_declined"
    application.worker_responded_at = datetime.now(timezone.utc)

    db.commit()

    confirmed_count = get_confirm_count_for_shift(db, shift.id)
    pending_count = get_pending_approved_count_for_shift(db, shift.id)

    if confirmed_count >= shift.workers_needed:
        shift.status = "assigned"
    elif pending_count > 0:
        shift.status = "pending_confirmation"
    else:
        shift.status = "open"

    db.commit()
    db.refresh(application)
    return application


def recompute_shift_status(db: Session, shift: shift):
    if shift.status in ["cancelled", "completed"]:
        db.refresh(shift)
        return shift

    confirmed_count = get_confirm_count_for_shift(db,shift.id)

    pending_count = get_pending_approved_count_for_shift(db,shift.id)

    if confirmed_count >= shift.workers_needed:
        shift.status = "assigned"

        remaining_approved = (
            db.query(shiftapplication)
            .filter(
                shiftapplication.shift_id == shift.id,
                shiftapplication.status == "client_approved"
            )
            .all()
        )

        for app in remaining_approved:
            app.status = "expired"

    elif pending_count > 0:
        shift.status = "pending_confirmation"
    else:
        shift.status = "open"

    db.commit()
    db.refresh(shift)
    return shift


def reject_application(db: Session, application: shiftapplication, shift: shift):
    application.status = "rejected"

    db.commit()
    db.refresh(application)

    recompute_shift_status(db, shift)

    return application


def withdraw_application(db: Session, application: shiftapplication, shift: shift):
    old_status = application.status

    application.status = "withdrawn"

    if (old_status == "client_approved"):
        application.worker_responded_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(application)

    recompute_shift_status(db, shift)

    return application





def get_worker_applications_detailed(db: Session, worker_id: int):
    rows = (
        db.query(
            shiftapplication.id.label("application_id"),
            shiftapplication.shift_id,
            shiftapplication.message,
            shiftapplication.status.label("application_status"),
            shiftapplication.applied_at,
            shiftapplication.client_approved_at,
            shiftapplication.worker_responded_at,
            shift.id.label("shift_id_real"),
            shift.title,
            shift.shift_date,
            shift.start_time,
            shift.end_time,
            shift.location,
            shift.pay_rate,
            shift.status.label("shift_status"),
        )
        .join(shift, shiftapplication.shift_id == shift.id)
        .filter(shiftapplication.worker_id == worker_id)
        .order_by(shiftapplication.applied_at.desc())
        .all()
    )

    return [
        {
            "application_id": row.application_id,
            "shift_id": row.shift_id,
            "message": row.message,
            "application_status": row.application_status,
            "applied_at": row.applied_at,
            "client_approved_at": row.client_approved_at,
            "worker_responded_at": row.worker_responded_at,
            "shift": {
                "id": row.shift_id_real,
                "title": row.title,
                "shift_date": row.shift_date,
                "start_time": row.start_time,
                "end_time": row.end_time,
                "location": row.location,
                "pay_rate": row.pay_rate,
                "status": row.shift_status,
            }
        }
        for row in rows
    ]


def get_shift_applicants_detailed(db: Session, shift_id: int):
    rows = (
        db.query(
            shiftapplication.id.label("application_id"),
            shiftapplication.shift_id,
            shiftapplication.worker_id,
            shiftapplication.message,
            shiftapplication.status,
            shiftapplication.applied_at,
            shiftapplication.client_approved_at,
            shiftapplication.worker_responded_at,
            workerprofile.full_name,
            workerprofile.location,
            workerprofile.experience_level,
            workerprofile.hourly_rate,
            workerprofile.availability_status,
        )
        .join(workerprofile, shiftapplication.worker_id == workerprofile.User_id)
        .filter(shiftapplication.shift_id == shift_id)
        .order_by(shiftapplication.applied_at.desc())
        .all()
    )

    return [
        {
            "application_id": row.application_id,
            "shift_id": row.shift_id,
            "worker_id": row.worker_id,
            "message": row.message,
            "status": row.status,
            "applied_at": row.applied_at,
            "client_approved_at": row.client_approved_at,
            "worker_responded_at": row.worker_responded_at,
            "worker": {
                "id": row.worker_id,
                "full_name": row.full_name,
                "location": row.location,
                "experience_level": row.experience_level,
                "hourly_rate": row.hourly_rate,
                "availability_status": row.availability_status,
            }
        }
        for row in rows
    ]