from fastapi import Depends, APIRouter, HTTPException, status

from schemas import clientprofilecreate, ClientProfileResponse, ClientProfileUpdate, WorkerProfileCreate, WorkerProfileResponse, WorkerProfileUpdate
from Routers.auth import get_current_user
from Database import get_db
from sqlalchemy.orm import session
from Logic.profile_logic import make_client_profile, get_client_profile, update_client_profile, get_worker_profile, make_worker_profile, update_worker_profile


router = APIRouter()

@router.post("/client", response_model=ClientProfileResponse, status_code=status.HTTP_201_CREATED)
def create_client_profile(profile_data:clientprofilecreate, db:session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can create a client profile"
        )
    
    existing_profile = get_client_profile(db, current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client profile already exists"
        )
    
    profile = make_client_profile(db, current_user.id,profile_data)
    return profile

@router.get("/client/me", response_model=ClientProfileResponse)
def get_my_client_profile(db:session=Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can access a client profile"
        )

    profile = get_client_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    
    return profile

@router.put("/client/me", response_model=ClientProfileResponse)
def update_my_client_profile(update_data:ClientProfileUpdate, db:session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can update a client profile"
        )
    
    profile = get_client_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    
    return update_client_profile(db,current_user.id,update_data)
    

@router.post("/worker", response_model=WorkerProfileResponse, status_code=status.HTTP_201_CREATED)
def create_worker_profile(
    profile_data: WorkerProfileCreate,
    db: session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can create a worker profile"
        )

    existing_profile = get_worker_profile(db, current_user.id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker profile already exists"
        )

    return make_worker_profile(db, current_user.id, profile_data)


@router.get("/worker/me", response_model=WorkerProfileResponse)
def get_my_worker_profile(
    db: session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can access a worker profile"
        )

    profile = get_worker_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )

    return profile


@router.put("/worker/me", response_model=WorkerProfileResponse)
def update_my_worker_profile(
    profile_data: WorkerProfileUpdate,
    db: session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only workers can update a worker profile"
        )

    profile = get_worker_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile not found"
        )

    return update_worker_profile(db, profile, profile_data)
