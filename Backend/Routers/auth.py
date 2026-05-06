from fastapi import APIRouter, Depends,HTTPException,status
from sqlalchemy.orm import Session
from jose import JWTError
from Database import get_db
from schemas import Usercreate, Userresponse,Tokenresponse,CurrentUserResponse,Loginrequest

from Logic.user_logic import get_user_by_email,get_user_by_name,create_user, authenticate_user, get_user_by_id
from security import create_access_token, oauth2_scheme, decode_access_token
router = APIRouter()

@router.post("/register", response_model=Userresponse, status_code=status.HTTP_201_CREATED)
def register_user(user:Usercreate, db: Session = Depends(get_db)):
    print("I am here")
    existing_email = get_user_by_email(db,user.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail= "Email Already Exists"
        ) 
    
    existing_username = get_user_by_name(db,user.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username Already Exists"
        )
    
    new_user = create_user(db,user)
    return new_user


@router.post("/login", response_model=Tokenresponse)
def login_user(login_data : Loginrequest, db: Session=Depends(get_db)):
    user = authenticate_user(db,login_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="USer Email or Password is Invalid"
        )
    
    access_token = create_access_token(
        data={
            "sub" : str(user.id),
            "email" : user.email,
            "role" : user.role
        }
    )

    return {"access_token":access_token,"token_type":"bearer"}



def get_current_user(token: str = Depends(oauth2_scheme), db: Session=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="credentials not valid"
    )

    try:
        payload = decode_access_token(token)
        print(payload)
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_id(db, int(user_id))

    return user
    
    
@router.get('/me',response_model=Userresponse)
def current_user(user = Depends(get_current_user)):
    if not user:
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "User Not Found"
        )
    return user


