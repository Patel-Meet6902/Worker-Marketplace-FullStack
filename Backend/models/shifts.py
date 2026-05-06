from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Date, Time, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from Database import Base


class shift(Base):

    __tablename__ = 'shifts'

    __table_args__ = (CheckConstraint("workers_needed>0",name = "check no of workers is valid"), 
                      CheckConstraint("status IN ('open', 'pending_confirmation', 'assigned', 'completed', 'cancelled')", name="check status"),
                      )

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete='CASCADE'), nullable = False)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    shift_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    location = Column(String(255), nullable=False)
    pay_rate = Column(Numeric(10, 2), nullable=False)
    workers_needed = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="open")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    client = relationship("User", back_populates='posted_shifts')

    applications = relationship("shiftapplication", back_populates="shift", cascade="all, delete-orphan")

