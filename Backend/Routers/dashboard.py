from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from Database import get_db
from Routers.auth import get_current_user
from schemas import ClientDashboardResponse, WorkerDashboardResponse
from Logic.dashboard_logic import get_client_dashboard_data, get_worker_dashboard_data

router = APIRouter()


@router.get("/client", response_model=ClientDashboardResponse)
def get_client_dashboard_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can access the client dashboard"
        )

    return get_client_dashboard_data(db, current_user.id)


@router.get("/worker", response_model=WorkerDashboardResponse)
def get_worker_dashboard_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access the worker dashboard"
        )

    return get_worker_dashboard_data(db, current_user.id)