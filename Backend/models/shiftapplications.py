from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from Database import Base


class shiftapplication(Base):
    __tablename__ = "shiftapplications"

    __table_args__ = (
        UniqueConstraint("shift_id", "worker_id", name="uq_shift_worker_application"),
        CheckConstraint(
            "status IN ('applied', 'client_approved', 'worker_confirmed', 'worker_declined', 'rejected', 'withdrawn', 'expired')",
            name="check_shift_application_status"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"),nullable=False)
    worker_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    message = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="applied")

    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    client_approved_at = Column(DateTime(timezone=True), nullable=True)
    worker_responded_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    shift = relationship("shift", back_populates="applications")
    worker = relationship("User", back_populates="shift_applications")








