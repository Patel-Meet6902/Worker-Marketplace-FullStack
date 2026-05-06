from models.clients import clientprofile
from models.workers import workerprofile

from sqlalchemy.orm import session

def get_client_profile(db:session, user_id:int):
    return db.query(clientprofile).filter(clientprofile.User_id == user_id).first()


def make_client_profile(db:session, user_id:int, profile_data):
    new_profile = clientprofile(
        User_id = user_id,
        company_name = profile_data.company_name,
        contact_name=profile_data.contact_name,
        phone=profile_data.phone,
        bio=profile_data.bio,
        location=profile_data.location,
        profile_image=profile_data.profile_image
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile

def update_client_profile(db:session, user_id:int, update_data):
    profile = get_client_profile(db,user_id)

    update_dict = update_data.model_dump(exclude_unset = True)
    for key, value in update_dict.items():
        setattr(profile,key,value)


    db.commit()
    db.refresh(profile)

    return profile



def get_worker_profile(db: session, user_id: int):
    return db.query(workerprofile).filter(workerprofile.User_id == user_id).first()


def make_worker_profile(db: session, user_id: int, profile_data):
    new_profile = workerprofile(
        User_id=user_id,
        full_name=profile_data.full_name,
        phone=profile_data.phone,
        bio=profile_data.bio,
        location=profile_data.location,
        experience_level=profile_data.experience_level,
        hourly_rate=profile_data.hourly_rate,
        availability_status=profile_data.availability_status or "available",
        profile_image=profile_data.profile_image
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


def update_worker_profile(db: session, profile: workerprofile, profile_data):
    update_data = profile_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile