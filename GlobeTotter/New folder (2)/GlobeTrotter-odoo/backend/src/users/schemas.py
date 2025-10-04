from ninja import Schema
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import uuid

class UserProfileSchema(Schema):
    """Schema for user profile response"""
    id: uuid.UUID
    bio: str = ""
    location: str = ""
    website: str = ""
    birth_date: Optional[date] = None
    phone_number: str = ""
    travel_style_preferences: Dict[str, Any] = {}
    notification_preferences: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

class UserProfileCreateSchema(Schema):
    """Schema for creating user profile"""
    bio: Optional[str] = ""
    location: Optional[str] = ""
    website: Optional[str] = ""
    birth_date: Optional[date] = None
    phone_number: Optional[str] = ""
    travel_style_preferences: Optional[Dict[str, Any]] = {}
    notification_preferences: Optional[Dict[str, Any]] = {}

class UserProfileUpdateSchema(Schema):
    """Schema for updating user profile"""
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    birth_date: Optional[date] = None
    phone_number: Optional[str] = None
    travel_style_preferences: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, Any]] = None

class SavedDestinationSchema(Schema):
    """Schema for saved destination response"""
    id: uuid.UUID
    city_name: str
    country: str
    notes: str = ""
    priority: int
    saved_at: datetime

class SavedDestinationCreateSchema(Schema):
    """Schema for creating saved destination"""
    city_name: str
    country: str
    notes: Optional[str] = ""
    priority: Optional[int] = 1

class SavedDestinationUpdateSchema(Schema):
    """Schema for updating saved destination"""
    city_name: Optional[str] = None
    country: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = None

class UserPreferencesSchema(Schema):
    """Schema for user preferences response"""
    id: uuid.UUID
    default_currency: str
    budget_range: str
    travel_style: str
    email_notifications: bool
    trip_reminders: bool
    budget_alerts: bool
    marketing_emails: bool
    profile_visibility: str
    trip_sharing_default: str
    created_at: datetime
    updated_at: datetime

class UserPreferencesCreateSchema(Schema):
    """Schema for creating user preferences"""
    default_currency: Optional[str] = "USD"
    budget_range: Optional[str] = "flexible"
    travel_style: Optional[str] = "adventure"
    email_notifications: Optional[bool] = True
    trip_reminders: Optional[bool] = True
    budget_alerts: Optional[bool] = True
    marketing_emails: Optional[bool] = False
    profile_visibility: Optional[str] = "public"
    trip_sharing_default: Optional[str] = "private"

class UserPreferencesUpdateSchema(Schema):
    """Schema for updating user preferences"""
    default_currency: Optional[str] = None
    budget_range: Optional[str] = None
    travel_style: Optional[str] = None
    email_notifications: Optional[bool] = None
    trip_reminders: Optional[bool] = None
    budget_alerts: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    profile_visibility: Optional[str] = None
    trip_sharing_default: Optional[str] = None

class CompleteUserProfileSchema(Schema):
    """Schema for complete user profile with all related data"""
    id: uuid.UUID
    email: str
    name: str
    photo_url: Optional[str] = None
    language_pref: str
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileSchema] = None
    preferences: Optional[UserPreferencesSchema] = None
    saved_destinations: List[SavedDestinationSchema] = []
    saved_destinations_count: int = 0

class UserStatsSchema(Schema):
    """Schema for user statistics"""
    total_trips: int
    total_destinations_visited: int
    total_activities: int
    total_budget_spent: float
    favorite_destination: Optional[str] = None
    average_trip_duration: float = 0.0
    most_expensive_trip: Optional[str] = None
