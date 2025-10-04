from ninja import Schema
from typing import Optional
from datetime import datetime
import uuid

class UserRegistrationSchema(Schema):
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    password: str
    password_confirm: str
    language_pref: Optional[str] = 'en'

class UserLoginSchema(Schema):
    email: str
    password: str

class UserProfileSchema(Schema):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None
    language_pref: str = 'en'
    created_at: datetime
    updated_at: datetime

class UserUpdateSchema(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    photo_url: Optional[str] = None
    language_pref: Optional[str] = None

class TokenResponseSchema(Schema):
    user: UserProfileSchema
    access: str
    refresh: str

class ForgotPasswordSchema(Schema):
    email: str

class ResetPasswordSchema(Schema):
    token: str
    new_password: str
    confirm_password: str

class ChangePasswordSchema(Schema):
    current_password: str
    new_password: str
    confirm_password: str

class MessageResponseSchema(Schema):
    message: str
    success: bool = True
