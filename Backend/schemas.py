from pydantic import BaseModel, EmailStr,Field
from typing import Literal,Optional
from decimal import Decimal
from datetime import datetime, date, time

class Usercreate(BaseModel):
    email : EmailStr
    username : str
    password : str
    role : Literal["worker","client"]

class Userresponse(BaseModel):
    id : int
    email : EmailStr
    username : str
    role : str
    is_active : bool

    class Config:
        from_attributes = True


class Loginrequest(BaseModel):
    email : EmailStr
    password : str

class Tokenresponse(BaseModel):
    access_token : str
    token_type : str

class CurrentUserResponse(BaseModel):
    id : int
    email: EmailStr
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
        





class clientprofilecreate(BaseModel): 
    company_name : Optional[str] = None
    contact_name : str
    phone : Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None

class ClientProfileResponse(BaseModel):
    id: int
    User_id: int
    company_name: Optional[str]
    contact_name: str
    phone: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    profile_image: Optional[str]

    class Config:
        from_attributes = True

class ClientProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None





class WorkerProfileCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    availability_status: Optional[str] = "available"
    profile_image: Optional[str] = None


class WorkerProfileResponse(BaseModel):
    id: int
    User_id: int
    full_name: str
    phone: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    experience_level: Optional[str]
    hourly_rate: Optional[Decimal]
    availability_status: str
    profile_image: Optional[str]

    class Config:
        from_attributes = True

class WorkerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    availability_status: Optional[str] = None
    profile_image: Optional[str] = None


class ShiftCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=5)
    shift_date: date
    start_time: time
    end_time: time
    location: str = Field(min_length=2, max_length=255)
    pay_rate: Decimal = Field(gt=0)
    workers_needed: int = Field(default=1, gt=0)


class ShiftUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=150)
    description: Optional[str] = Field(default=None, min_length=5)
    shift_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    location: Optional[str] = Field(default=None, min_length=2, max_length=255)
    pay_rate: Optional[Decimal] = Field(default=None, gt=0)
    workers_needed: Optional[int] = Field(default=None, gt=0)
    status: Optional[Literal["open", "pending_confirmation", "assigned", "completed", "cancelled"]] = None


class ShiftResponse(BaseModel):
    id: int
    client_id: int
    title: str
    description: str
    shift_date: date
    start_time: time
    end_time: time
    location: str
    pay_rate: Decimal
    workers_needed: int
    status: str

    class Config:
        from_attributes = True


class ShiftApplicationCreate(BaseModel):
    message: Optional[str] = None

class ShiftApplicationResponse(BaseModel):
    id: int
    shift_id: int
    worker_id: int
    message: Optional[str]
    status: str
    applied_at: datetime
    client_approved_at: Optional[datetime]
    worker_responded_at: Optional[datetime]
    updated_at: datetime

    class Config:
        from_attributes = True



# Dashboard


class ClientRecentShiftResponse(BaseModel):
    shift_id: int
    title: str
    shift_date: date
    start_time: time
    end_time: time
    location: str
    status: str
    workers_needed: int
    application_count: int
    confirmed_workers_count: int


class ClientDashboardResponse(BaseModel):
    total_shifts: int
    open_shifts: int
    pending_confirmation_shifts: int
    assigned_shifts: int
    completed_shifts: int
    cancelled_shifts: int
    total_applications_received: int
    recent_shifts: list[ClientRecentShiftResponse]


class WorkerRecentApplicationResponse(BaseModel):
    application_id: int
    shift_id: int
    title: str
    shift_date: date
    start_time: time
    end_time: time
    location: str
    application_status: str
    shift_status: str
    applied_at: datetime


class WorkerDashboardResponse(BaseModel):
    total_applications: int
    applied_applications: int
    client_approved_applications: int
    confirmed_applications: int
    declined_applications: int
    rejected_applications: int
    withdrawn_applications: int
    expired_applications: int
    assigned_shifts_count: int
    recent_applications: list[WorkerRecentApplicationResponse]




class ClientShiftItemResponse(BaseModel):
    id: int
    title: str
    description: str
    shift_date: date
    start_time: time
    end_time: time
    location: str
    pay_rate: Decimal
    workers_needed: int
    status: str
    application_count: int
    confirmed_workers_count: int


class ShiftMiniResponse(BaseModel):
    id: int
    title: str
    shift_date: date
    start_time: time
    end_time: time
    location: str
    pay_rate: Decimal
    status: str


class WorkerMiniResponse(BaseModel):
    id: int
    full_name: str
    location: Optional[str] = None
    experience_level: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    availability_status: Optional[str] = None


class WorkerApplicationDetailedResponse(BaseModel):
    application_id: int
    shift_id: int
    message: Optional[str]
    application_status: str
    applied_at: datetime
    client_approved_at: Optional[datetime]
    worker_responded_at: Optional[datetime]
    shift: ShiftMiniResponse


class ShiftApplicantDetailedResponse(BaseModel):
    application_id: int
    shift_id: int
    worker_id: int
    message: Optional[str]
    status: str
    applied_at: datetime
    client_approved_at: Optional[datetime]
    worker_responded_at: Optional[datetime]
    worker: WorkerMiniResponse



# Notification schemas

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    related_shift_id: Optional[int] = None
    related_application_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationUnreadCountResponse(BaseModel):
    unread_count: int



class ChatConversationResponse(BaseModel):
    id: int
    shift_id: int
    shift_title: str
    other_user_id: int
    other_user_name: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int
    created_at: datetime


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str
    content: str
    is_read: bool
    created_at: datetime


