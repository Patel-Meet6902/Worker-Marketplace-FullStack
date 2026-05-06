from models.user import User
from sqlalchemy.orm import session
from security import hash_password, verify_password

def get_user_by_email(db:session, email:str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db:session,user_id:int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_name(db:session, username:str):
    return db.query(User).filter(User.username == username).first()

def create_user(db:session,user):
    hashed_password = hash_password(user.password)

    # fake_db = {
    #     "email": "meetpatel22178@gmail.com",
    #     "username" : "Meet",
    #     "password" : "12345678",
    #     "role" : "client"
    # }

    # hashed_password = hash_password(fake_db["password"])
    # new_user = User(
    #     email = fake_db["email"],
    #     username = fake_db["username"],
    #     password_hash = fake_db["password"],
    #     role = fake_db["role"]
    # )

    new_user = User(
        email = user.email,
        username = user.username,
        password_hash = hashed_password,
        role = user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db,login_data):
    user = get_user_by_email(db,login_data.email)

    if not user :
        return None
    
    if not verify_password(login_data.password, user.password_hash):
        return None
    
    return user