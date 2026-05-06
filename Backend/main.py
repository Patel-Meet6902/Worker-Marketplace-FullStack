from fastapi import FastAPI
from Database import Base,engine
from models.user import User
from models.clients import clientprofile
from models.workers import workerprofile
from models.shifts import shift
from models.shiftapplications import shiftapplication
from models.notification import notification
from models.conversation import conversation
from models.message import message

from Routers.auth import router as auth_router
from Routers.profile import router as profile_router
from Routers.shift import router as shift_router
from Routers.applications import router as applications_router
from Routers.dashboard import router as dashboard_router
from Routers.notifications import router as notification_router
from Routers.chat import router as chat_router


from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title='Workers marketplace')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router,prefix='/auth',tags=["Auth"])
app.include_router(profile_router,prefix='/profiles',tags=["Profiles"])
app.include_router(shift_router,prefix='/shifts', tags=['shift'])
app.include_router(applications_router, prefix="/applications", tags=["Applications"])
app.include_router(dashboard_router, prefix='/dashboard', tags=['Dashboard'])
app.include_router(notification_router, prefix='/notifications', tags=['Notifications'])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])


@app.get("/")
def root():
    return {"hello":"you have registered"}

