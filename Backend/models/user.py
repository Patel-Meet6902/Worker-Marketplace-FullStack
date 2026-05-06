from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from Database import Base

class User(Base):

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('client', 'worker')", name="check_user_role"),
    )

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(225),unique=True,nullable=False,index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    client_profile = relationship("clientprofile", back_populates="user", uselist=False)
    worker_profile = relationship("workerprofile", back_populates="user", uselist=False)
    posted_shifts = relationship("shift", back_populates='client',cascade="all, delete-orphan")
    shift_applications = relationship("shiftapplication", back_populates="worker", cascade="all, delete-orphan")

    
    