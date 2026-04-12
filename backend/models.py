from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    service_accounts = relationship("ServiceAccount", back_populates="user")
    templates = relationship("Template", back_populates="user")
    tickets = relationship("SupportTicket", back_populates="user", foreign_keys="SupportTicket.user_id")

class ServiceAccount(Base):
    __tablename__ = "service_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    json_key_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="service_accounts")
    apps = relationship("App", back_populates="service_account")

class App(Base):
    __tablename__ = "apps"
    
    id = Column(Integer, primary_key=True, index=True)
    service_account_id = Column(Integer, ForeignKey("service_accounts.id"), nullable=False)
    package_name = Column(String, unique=True, nullable=False)
    app_name = Column(String)
    icon_url = Column(String)
    last_synced = Column(DateTime)
    
    # AAB fayl ma'lumotlari
    aab_file_path = Column(String, nullable=True)
    aab_version_code = Column(Integer, nullable=True)
    aab_version_name = Column(String, nullable=True)
    aab_uploaded_at = Column(DateTime, nullable=True)
    
    # Status va Draft
    status = Column(String, default='draft')
    draft_title = Column(String, nullable=True)
    draft_short_description = Column(String, nullable=True)
    draft_full_description = Column(Text, nullable=True)
    draft_language = Column(String, default='en')
    draft_updated_at = Column(DateTime, nullable=True)
    
    # Google Play'dan olingan real til
    default_language = Column(String, default='en-US')
    contact_email = Column(String, nullable=True)
    
    service_account = relationship("ServiceAccount", back_populates="apps")
    listings = relationship("Listing", back_populates="app")

class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("apps.id"), nullable=False)
    language = Column(String, nullable=False)
    title = Column(String)
    short_description = Column(String)
    full_description = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    app = relationship("App", back_populates="listings")

class Graphic(Base):
    __tablename__ = "graphics"
    
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("apps.id"), nullable=False)
    graphic_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    title = Column(String)
    short_description = Column(String)
    full_description = Column(Text)
    icon_path = Column(String)
    feature_graphic_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="templates")

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    status = Column(String, default='open')  # open, in_progress, resolved, closed
    priority = Column(String, default='medium')  # low, medium, high
    category = Column(String, default='general')  # general, bug, feature, billing
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="tickets", foreign_keys=[user_id])
    messages = relationship("SupportMessage", back_populates="ticket", order_by="SupportMessage.created_at")

class SupportMessage(Base):
    __tablename__ = "support_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("SupportTicket", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
