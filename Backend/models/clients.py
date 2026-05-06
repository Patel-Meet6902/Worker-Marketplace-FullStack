from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, CheckConstraint, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from Database import Base


class clientprofile(Base):

    __tablename__ = "clients"

    id = Column(Integer,primary_key=True, index=True)
    User_id = Column(Integer, ForeignKey("users.id",ondelete='CASCADE'),unique=True,nullable=False)
    company_name = Column(String(255), nullable=True)
    contact_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    profile_image = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User",back_populates="client_profile")