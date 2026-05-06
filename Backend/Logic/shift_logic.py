from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func

from models.shifts import shift
from models.shiftapplications import shiftapplication



def create_shift(db: Session, client_id: int, shift_data):
    new_shift = shift(
        client_id=client_id,
        title=shift_data.title,
        description=shift_data.description,
        shift_date=shift_data.shift_date,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        location=shift_data.location,
        pay_rate=shift_data.pay_rate,
        workers_needed=shift_data.workers_needed,
        status="open"
    )

    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift


def get_all_shifts(
    db: Session,
    location,
    shift_status,
    shift_date,
    min_pay,
    max_pay,
    sort_by="created_at",
    sort_order="desc"
):
    query = db.query(shift)

    if location:
        query = query.filter(shift.location.ilike(f"%{location}%"))

    if shift_status:
        query = query.filter(shift.status == shift_status)

    if shift_date:
        query = query.filter(shift.shift_date == shift_date)

    if min_pay is not None:
        query = query.filter(shift.pay_rate >= min_pay)

    if max_pay is not None:
        query = query.filter(shift.pay_rate <= max_pay)

    sort_column_map = {
        "created_at": shift.created_at,
        "shift_date": shift.shift_date,
        "pay_rate": shift.pay_rate,
    }

    sort_column = sort_column_map.get(sort_by, shift.created_at)

    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    return query.all()



def get_shift_by_id(db: Session, shift_id: int):
    return db.query(shift).filter(shift.id == shift_id).first()


def update_shift(db: Session, shift: shift, shift_data):
    update_data = shift_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(shift, key, value)

    db.commit()
    db.refresh(shift)
    return shift


def delete_shift(db: Session, shift: shift):
    db.delete(shift)
    db.commit()



def cancel_shift(db: Session, shift: shift):
    shift.status = "cancelled"

    pending_apps = (
        db.query(shiftapplication)
        .filter(
            shiftapplication.shift_id == shift.id,
            shiftapplication.status.in_(["applied", "client_approved"])
        )
        .all()
    )

    for app in pending_apps:
        app.status = "rejected"

    db.commit()
    db.refresh(shift)
    return shift


def complete_shift(db: Session, shift: shift):
    shift.status = "completed"

    db.commit()
    db.refresh(shift)
    return shift










def get_my_client_shifts(db: Session, client_id: int):
    application_count_subquery = (
        db.query(
            shiftapplication.shift_id.label("shift_id"),
            func.count(shiftapplication.id).label("application_count")
        )
        .group_by(shiftapplication.shift_id)
        .subquery()
    )

    confirmed_count_subquery = (
        db.query(
            shiftapplication.shift_id.label("shift_id"),
            func.count(shiftapplication.id).label("confirmed_workers_count")
        )
        .filter(shiftapplication.status == "worker_confirmed")
        .group_by(shiftapplication.shift_id)
        .subquery()
    )

    rows = (
        db.query(
            shift.id,
            shift.title,
            shift.description,
            shift.shift_date,
            shift.start_time,
            shift.end_time,
            shift.location,
            shift.pay_rate,
            shift.workers_needed,
            shift.status,
            func.coalesce(application_count_subquery.c.application_count, 0).label("application_count"),
            func.coalesce(confirmed_count_subquery.c.confirmed_workers_count, 0).label("confirmed_workers_count"),
        )
        .outerjoin(application_count_subquery, shift.id == application_count_subquery.c.shift_id)
        .outerjoin(confirmed_count_subquery, shift.id == confirmed_count_subquery.c.shift_id)
        .filter(shift.client_id == client_id)
        .order_by(shift.created_at.desc())
        .all()
    )

    return [
        {
            "id": row.id,
            "title": row.title,
            "description": row.description,
            "shift_date": row.shift_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "location": row.location,
            "pay_rate": row.pay_rate,
            "workers_needed": row.workers_needed,
            "status": row.status,
            "application_count": row.application_count,
            "confirmed_workers_count": row.confirmed_workers_count,
        }
        for row in rows
    ]