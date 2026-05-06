from sqlalchemy.orm import Session
from sqlalchemy import func, case

from models.shifts import shift
from models.shiftapplications import shiftapplication


def get_client_dashboard_data(db: Session, client_id: int):
    # 1. Aggregate shift counts in one query
    shift_counts = (
        db.query(
            func.count(shift.id).label("total_shifts"),
            func.sum(case((shift.status == "open", 1), else_=0)).label("open_shifts"),
            func.sum(case((shift.status == "pending_confirmation", 1), else_=0)).label("pending_confirmation_shifts"),
            func.sum(case((shift.status == "assigned", 1), else_=0)).label("assigned_shifts"),
            func.sum(case((shift.status == "completed", 1), else_=0)).label("completed_shifts"),
            func.sum(case((shift.status == "cancelled", 1), else_=0)).label("cancelled_shifts"),
        )
        .filter(shift.client_id == client_id)
        .first()
    )

    # 2. Total applications received in one query
    total_applications_received = (
        db.query(func.count(shiftapplication.id))
        .join(shift, shiftapplication.shift_id == shift.id)
        .filter(shift.client_id == client_id)
        .scalar()
    ) or 0

    # 3. Subquery for application count per shift
    application_count_subquery = (
        db.query(
            shiftapplication.shift_id.label("shift_id"),
            func.count(shiftapplication.id).label("application_count")
        )
        .group_by(shiftapplication.shift_id)
        .subquery()
    )

    # 4. Subquery for confirmed workers count per shift
    confirmed_count_subquery = (
        db.query(
            shiftapplication.shift_id.label("shift_id"),
            func.count(shiftapplication.id).label("confirmed_workers_count")
        )
        .filter(shiftapplication.status == "worker_confirmed")
        .group_by(shiftapplication.shift_id)
        .subquery()
    )

    # 5. Recent shifts with counts in one query
    recent_shift_rows = (
        db.query(
            shift.id.label("shift_id"),
            shift.title,
            shift.shift_date,
            shift.start_time,
            shift.end_time,
            shift.location,
            shift.status,
            shift.workers_needed,
            func.coalesce(application_count_subquery.c.application_count, 0).label("application_count"),
            func.coalesce(confirmed_count_subquery.c.confirmed_workers_count, 0).label("confirmed_workers_count"),
        )
        .outerjoin(application_count_subquery, shift.id == application_count_subquery.c.shift_id)
        .outerjoin(confirmed_count_subquery, shift.id == confirmed_count_subquery.c.shift_id)
        .filter(shift.client_id == client_id)
        .order_by(shift.created_at.desc())
        .limit(5)
        .all()
    )

    recent_shifts = [
        {
            "shift_id": row.shift_id,
            "title": row.title,
            "shift_date": row.shift_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "location": row.location,
            "status": row.status,
            "workers_needed": row.workers_needed,
            "application_count": row.application_count,
            "confirmed_workers_count": row.confirmed_workers_count,
        }
        for row in recent_shift_rows
    ]

    return {
        "total_shifts": shift_counts.total_shifts or 0,
        "open_shifts": shift_counts.open_shifts or 0,
        "pending_confirmation_shifts": shift_counts.pending_confirmation_shifts or 0,
        "assigned_shifts": shift_counts.assigned_shifts or 0,
        "completed_shifts": shift_counts.completed_shifts or 0,
        "cancelled_shifts": shift_counts.cancelled_shifts or 0,
        "total_applications_received": total_applications_received,
        "recent_shifts": recent_shifts,
    }


def get_worker_dashboard_data(db: Session, worker_id: int):
    # 1. Aggregate application counts in one query
    application_counts = (
        db.query(
            func.count(shiftapplication.id).label("total_applications"),
            func.sum(case((shiftapplication.status == "applied", 1), else_=0)).label("applied_applications"),
            func.sum(case((shiftapplication.status == "client_approved", 1), else_=0)).label("client_approved_applications"),
            func.sum(case((shiftapplication.status == "worker_confirmed", 1), else_=0)).label("confirmed_applications"),
            func.sum(case((shiftapplication.status == "worker_declined", 1), else_=0)).label("declined_applications"),
            func.sum(case((shiftapplication.status == "rejected", 1), else_=0)).label("rejected_applications"),
            func.sum(case((shiftapplication.status == "withdrawn", 1), else_=0)).label("withdrawn_applications"),
            func.sum(case((shiftapplication.status == "expired", 1), else_=0)).label("expired_applications"),
        )
        .filter(shiftapplication.worker_id == worker_id)
        .first()
    )

    # 2. Assigned shifts count
    assigned_shifts_count = (
        db.query(func.count(shiftapplication.id))
        .join(shift, shiftapplication.shift_id == shift.id)
        .filter(
            shiftapplication.worker_id == worker_id,
            shiftapplication.status == "worker_confirmed",
            shift.status == "assigned"
        )
        .scalar()
    ) or 0

    # 3. Recent applications with shift details
    recent_application_rows = (
        db.query(
            shiftapplication.id.label("application_id"),
            shift.id.label("shift_id"),
            shift.title,
            shift.shift_date,
            shift.start_time,
            shift.end_time,
            shift.location,
            shiftapplication.status.label("application_status"),
            shift.status.label("shift_status"),
            shiftapplication.applied_at,
        )
        .join(shift, shiftapplication.shift_id == shift.id)
        .filter(shiftapplication.worker_id == worker_id)
        .order_by(shiftapplication.applied_at.desc())
        .limit(5)
        .all()
    )

    recent_applications = [
        {
            "application_id": row.application_id,
            "shift_id": row.shift_id,
            "title": row.title,
            "shift_date": row.shift_date,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "location": row.location,
            "application_status": row.application_status,
            "shift_status": row.shift_status,
            "applied_at": row.applied_at,
        }
        for row in recent_application_rows
    ]

    return {
        "total_applications": application_counts.total_applications or 0,
        "applied_applications": application_counts.applied_applications or 0,
        "client_approved_applications": application_counts.client_approved_applications or 0,
        "confirmed_applications": application_counts.confirmed_applications or 0,
        "declined_applications": application_counts.declined_applications or 0,
        "rejected_applications": application_counts.rejected_applications or 0,
        "withdrawn_applications": application_counts.withdrawn_applications or 0,
        "expired_applications": application_counts.expired_applications or 0,
        "assigned_shifts_count": assigned_shifts_count,
        "recent_applications": recent_applications,
    }