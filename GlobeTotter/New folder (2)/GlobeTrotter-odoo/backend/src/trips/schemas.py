from ninja import Schema
from typing import Optional, List, Dict, Any
from datetime import date, time, datetime
from decimal import Decimal
import uuid
import uuid

# Activity Schemas
class ActivitySchema(Schema):
    """Schema for activity response"""
    id: uuid.UUID
    name: str
    category: str
    description: str = ""
    notes: str = ""
    location_name: str = ""
    address: str = ""
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    cost: Optional[Decimal] = None
    currency: str = "USD"
    is_paid: bool = False
    priority: int = 2
    is_booked: bool = False
    booking_reference: str = ""
    website_url: str = ""
    phone_number: str = ""
    image_url: Optional[str] = None
    weather_dependent: bool = False
    indoor_activity: bool = False
    created_at: datetime
    updated_at: datetime

class ActivityCreateSchema(Schema):
    """Schema for creating activity"""
    name: str
    category: Optional[str] = "other"
    description: Optional[str] = ""
    notes: Optional[str] = ""
    location_name: Optional[str] = ""
    address: Optional[str] = ""
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    cost: Optional[Decimal] = None
    currency: Optional[str] = "USD"
    is_paid: Optional[bool] = False
    priority: Optional[int] = 2
    is_booked: Optional[bool] = False
    booking_reference: Optional[str] = ""
    website_url: Optional[str] = ""
    phone_number: Optional[str] = ""
    image_url: Optional[str] = None
    weather_dependent: Optional[bool] = False
    indoor_activity: Optional[bool] = False

class ActivityUpdateSchema(Schema):
    """Schema for updating activity"""
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    cost: Optional[Decimal] = None
    currency: Optional[str] = None
    is_paid: Optional[bool] = None
    priority: Optional[int] = None
    is_booked: Optional[bool] = None
    booking_reference: Optional[str] = None
    website_url: Optional[str] = None
    phone_number: Optional[str] = None
    image_url: Optional[str] = None
    weather_dependent: Optional[bool] = None
    indoor_activity: Optional[bool] = None

# Stop Schemas
class StopSchema(Schema):
    """Schema for stop response"""
    id: uuid.UUID
    city_name: str
    country: str
    start_date: date
    end_date: date
    order_index: int
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: str = ""
    notes: str = ""
    accommodation_name: str = ""
    accommodation_address: str = ""
    accommodation_cost: Optional[Decimal] = None
    activities: List[ActivitySchema] = []
    activities_count: int = 0
    duration_days: int = 0
    created_at: datetime
    updated_at: datetime

class StopCreateSchema(Schema):
    """Schema for creating stop"""
    city_name: str
    country: str
    start_date: date
    end_date: date
    order_index: Optional[int] = 0
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: Optional[str] = ""
    notes: Optional[str] = ""
    accommodation_name: Optional[str] = ""
    accommodation_address: Optional[str] = ""
    accommodation_cost: Optional[Decimal] = None

class StopUpdateSchema(Schema):
    """Schema for updating stop"""
    city_name: Optional[str] = None
    country: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    order_index: Optional[int] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    timezone: Optional[str] = None
    notes: Optional[str] = None
    accommodation_name: Optional[str] = None
    accommodation_address: Optional[str] = None
    accommodation_cost: Optional[Decimal] = None

# Budget Schemas
class BudgetSchema(Schema):
    """Schema for budget response"""
    id: uuid.UUID
    transport_cost: Decimal
    stay_cost: Decimal
    activity_cost: Decimal
    meal_cost: Decimal
    shopping_cost: Decimal
    miscellaneous_cost: Decimal
    transport_limit: Optional[Decimal] = None
    stay_limit: Optional[Decimal] = None
    activity_limit: Optional[Decimal] = None
    meal_limit: Optional[Decimal] = None
    shopping_limit: Optional[Decimal] = None
    miscellaneous_limit: Optional[Decimal] = None
    currency: str
    total_cost: Decimal
    total_limit: Optional[Decimal] = None
    is_over_budget: bool = False
    created_at: datetime
    updated_at: datetime

class BudgetCreateSchema(Schema):
    """Schema for creating budget"""
    transport_cost: Optional[Decimal] = Decimal('0.00')
    stay_cost: Optional[Decimal] = Decimal('0.00')
    activity_cost: Optional[Decimal] = Decimal('0.00')
    meal_cost: Optional[Decimal] = Decimal('0.00')
    shopping_cost: Optional[Decimal] = Decimal('0.00')
    miscellaneous_cost: Optional[Decimal] = Decimal('0.00')
    transport_limit: Optional[Decimal] = None
    stay_limit: Optional[Decimal] = None
    activity_limit: Optional[Decimal] = None
    meal_limit: Optional[Decimal] = None
    shopping_limit: Optional[Decimal] = None
    miscellaneous_limit: Optional[Decimal] = None
    currency: Optional[str] = "USD"

class BudgetUpdateSchema(Schema):
    """Schema for updating budget"""
    transport_cost: Optional[Decimal] = None
    stay_cost: Optional[Decimal] = None
    activity_cost: Optional[Decimal] = None
    meal_cost: Optional[Decimal] = None
    shopping_cost: Optional[Decimal] = None
    miscellaneous_cost: Optional[Decimal] = None
    transport_limit: Optional[Decimal] = None
    stay_limit: Optional[Decimal] = None
    activity_limit: Optional[Decimal] = None
    meal_limit: Optional[Decimal] = None
    shopping_limit: Optional[Decimal] = None
    miscellaneous_limit: Optional[Decimal] = None
    currency: Optional[str] = None

# Trip Schemas
class TripSchema(Schema):
    """Schema for complete trip response"""
    id: uuid.UUID
    name: str
    description: str = ""
    start_date: date
    end_date: date
    cover_image: Optional[str] = None
    is_public: bool = False
    status: str = "planning"
    estimated_budget: Optional[Decimal] = None
    actual_budget: Optional[Decimal] = None
    currency: str = "USD"
    collaborators_can_edit: bool = False
    auto_calculate_budget: bool = True
    created_at: datetime
    updated_at: datetime
    stops: List[StopSchema] = []
    budget: Optional[BudgetSchema] = None
    stops_count: int = 0
    activities_count: int = 0
    duration_days: int = 0

class TripListSchema(Schema):
    """Schema for trip list response (simplified)"""
    id: uuid.UUID
    name: str
    description: str = ""
    start_date: date
    end_date: date
    cover_image: Optional[str] = None
    status: str
    estimated_budget: Optional[Decimal] = None
    currency: str = "USD"
    stops_count: int = 0
    activities_count: int = 0
    duration_days: int = 0
    created_at: datetime

class TripCreateSchema(Schema):
    """Schema for creating trip"""
    name: str
    description: Optional[str] = ""
    start_date: date
    end_date: date
    cover_image: Optional[str] = None
    estimated_budget: Optional[Decimal] = None
    currency: Optional[str] = "USD"
    collaborators_can_edit: Optional[bool] = False
    auto_calculate_budget: Optional[bool] = True

class TripUpdateSchema(Schema):
    """Schema for updating trip"""
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    cover_image: Optional[str] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None
    estimated_budget: Optional[Decimal] = None
    actual_budget: Optional[Decimal] = None
    currency: Optional[str] = None
    collaborators_can_edit: Optional[bool] = None
    auto_calculate_budget: Optional[bool] = None

# Shared Itinerary Schemas
class SharedItinerarySchema(Schema):
    """Schema for shared itinerary response"""
    id: uuid.UUID
    public_slug: str
    allow_comments: bool
    allow_copying: bool
    password_protected: bool
    view_count: int
    copy_count: int
    created_at: datetime
    expires_at: Optional[datetime] = None
    trip: TripSchema

class SharedItineraryCreateSchema(Schema):
    """Schema for creating shared itinerary"""
    allow_comments: Optional[bool] = True
    allow_copying: Optional[bool] = True
    password_protected: Optional[bool] = False
    access_password: Optional[str] = ""
    expires_at: Optional[datetime] = None

class ShareResponseSchema(Schema):
    """Schema for share response"""
    public_url: str
    public_slug: str
    expires_at: Optional[datetime] = None

# Collaborator Schemas
class TripCollaboratorSchema(Schema):
    """Schema for trip collaborator response"""
    id: uuid.UUID
    user_id: uuid.UUID
    user_email: str
    user_name: str
    permission_level: str
    status: str
    invited_at: datetime
    responded_at: Optional[datetime] = None

class TripCollaboratorInviteSchema(Schema):
    """Schema for inviting collaborator"""
    email: str
    permission_level: Optional[str] = "view"

class TripCollaboratorUpdateSchema(Schema):
    """Schema for updating collaborator"""
    permission_level: Optional[str] = None
    status: Optional[str] = None

# Template Schemas
class TripTemplateSchema(Schema):
    """Schema for trip template response"""
    id: uuid.UUID
    name: str
    description: str = ""
    category: str = ""
    template_data: Dict[str, Any] = {}
    duration_days: int
    estimated_budget: Optional[Decimal] = None
    difficulty_level: str = "moderate"
    is_public: bool = False
    use_count: int = 0
    created_at: datetime
    updated_at: datetime

class TripTemplateCreateSchema(Schema):
    """Schema for creating trip template"""
    name: str
    description: Optional[str] = ""
    category: Optional[str] = ""
    template_data: Optional[Dict[str, Any]] = {}
    duration_days: int
    estimated_budget: Optional[Decimal] = None
    difficulty_level: Optional[str] = "moderate"
    is_public: Optional[bool] = False

# City Schemas
class CitySchema(Schema):
    """Schema for city information"""
    id: uuid.UUID
    name: str
    country: str
    country_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    population: Optional[int] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    description: str = ""
    best_time_to_visit: str = ""
    average_temperature: Optional[float] = None
    popular_attractions: List[str] = []
    travel_tips: List[str] = []
    safety_rating: Optional[int] = None
    cost_level: Optional[str] = None  # budget, moderate, expensive
    image_url: Optional[str] = None
    weather_info: Dict[str, Any] = {}
    transport_options: List[str] = []
    created_at: datetime
    updated_at: datetime

class CityCreateSchema(Schema):
    """Schema for creating city"""
    name: str
    country: str
    country_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    population: Optional[int] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = ""
    best_time_to_visit: Optional[str] = ""
    average_temperature: Optional[float] = None
    popular_attractions: Optional[List[str]] = []
    travel_tips: Optional[List[str]] = []
    safety_rating: Optional[int] = None
    cost_level: Optional[str] = None
    image_url: Optional[str] = None
    weather_info: Optional[Dict[str, Any]] = {}
    transport_options: Optional[List[str]] = []

class CityUpdateSchema(Schema):
    """Schema for updating city"""
    name: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    population: Optional[int] = None
    currency: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    average_temperature: Optional[float] = None
    popular_attractions: Optional[List[str]] = None
    travel_tips: Optional[List[str]] = None
    safety_rating: Optional[int] = None
    cost_level: Optional[str] = None
    image_url: Optional[str] = None
    weather_info: Optional[Dict[str, Any]] = None
    transport_options: Optional[List[str]] = None

class CityListSchema(Schema):
    """Schema for city list response (simplified)"""
    id: uuid.UUID
    name: str
    country: str
    country_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    cost_level: Optional[str] = None
    safety_rating: Optional[int] = None
    image_url: Optional[str] = None
    popular_attractions_count: int = 0

# Search and Discovery Schemas
class CitySearchSchema(Schema):
    """Schema for city search results"""
    name: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    popular_attractions: List[str] = []

# Activity Catalog Schemas
class ActivityCatalogSchema(Schema):
    """Schema for activity catalog response"""
    id: uuid.UUID
    name: str
    category: str
    description: str = ""
    city_name: str
    country: str
    location_name: str = ""
    address: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    average_cost: Optional[Decimal] = None
    cost_range_min: Optional[Decimal] = None
    cost_range_max: Optional[Decimal] = None
    currency: str = "USD"
    estimated_duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None  # easy, moderate, challenging, expert
    age_restriction: Optional[int] = None
    group_size_min: Optional[int] = None
    group_size_max: Optional[int] = None
    season_availability: List[str] = []  # spring, summer, fall, winter
    operating_hours: Dict[str, Any] = {}
    website_url: str = ""
    phone_number: str = ""
    email: str = ""
    booking_required: bool = False
    advance_booking_days: Optional[int] = None
    cancellation_policy: str = ""
    rating: Optional[float] = None
    review_count: int = 0
    popular_times: Dict[str, Any] = {}
    accessibility_features: List[str] = []
    included_amenities: List[str] = []
    what_to_bring: List[str] = []
    safety_guidelines: List[str] = []
    image_urls: List[str] = []
    video_url: Optional[str] = None
    tags: List[str] = []
    is_verified: bool = False
    last_updated: datetime
    created_at: datetime

class ActivityCatalogCreateSchema(Schema):
    """Schema for creating activity catalog entry"""
    name: str
    category: str
    description: Optional[str] = ""
    city_name: str
    country: str
    location_name: Optional[str] = ""
    address: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    average_cost: Optional[Decimal] = None
    cost_range_min: Optional[Decimal] = None
    cost_range_max: Optional[Decimal] = None
    currency: Optional[str] = "USD"
    estimated_duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    age_restriction: Optional[int] = None
    group_size_min: Optional[int] = None
    group_size_max: Optional[int] = None
    season_availability: Optional[List[str]] = []
    operating_hours: Optional[Dict[str, Any]] = {}
    website_url: Optional[str] = ""
    phone_number: Optional[str] = ""
    email: Optional[str] = ""
    booking_required: Optional[bool] = False
    advance_booking_days: Optional[int] = None
    cancellation_policy: Optional[str] = ""
    accessibility_features: Optional[List[str]] = []
    included_amenities: Optional[List[str]] = []
    what_to_bring: Optional[List[str]] = []
    safety_guidelines: Optional[List[str]] = []
    image_urls: Optional[List[str]] = []
    video_url: Optional[str] = None
    tags: Optional[List[str]] = []

class ActivityCatalogUpdateSchema(Schema):
    """Schema for updating activity catalog entry"""
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    city_name: Optional[str] = None
    country: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    average_cost: Optional[Decimal] = None
    cost_range_min: Optional[Decimal] = None
    cost_range_max: Optional[Decimal] = None
    currency: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    age_restriction: Optional[int] = None
    group_size_min: Optional[int] = None
    group_size_max: Optional[int] = None
    season_availability: Optional[List[str]] = None
    operating_hours: Optional[Dict[str, Any]] = None
    website_url: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    booking_required: Optional[bool] = None
    advance_booking_days: Optional[int] = None
    cancellation_policy: Optional[str] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    popular_times: Optional[Dict[str, Any]] = None
    accessibility_features: Optional[List[str]] = None
    included_amenities: Optional[List[str]] = None
    what_to_bring: Optional[List[str]] = None
    safety_guidelines: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    video_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_verified: Optional[bool] = None

class ActivityCatalogListSchema(Schema):
    """Schema for activity catalog list response (simplified)"""
    id: uuid.UUID
    name: str
    category: str
    city_name: str
    country: str
    average_cost: Optional[Decimal] = None
    currency: str = "USD"
    estimated_duration_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    rating: Optional[float] = None
    review_count: int = 0
    booking_required: bool = False
    image_urls: List[str] = []
    tags: List[str] = []
    is_verified: bool = False

class ActivitySearchSchema(Schema):
    """Schema for activity search results"""
    name: str
    category: str
    description: str = ""
    estimated_cost: Optional[Decimal] = None
    duration_minutes: Optional[int] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None

class SearchFiltersSchema(Schema):
    """Schema for search filters"""
    query: Optional[str] = ""
    category: Optional[str] = None
    min_cost: Optional[Decimal] = None
    max_cost: Optional[Decimal] = None
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    indoor_only: Optional[bool] = False
    weather_independent: Optional[bool] = False

# Analytics and Stats Schemas
class TripStatsSchema(Schema):
    """Schema for trip statistics"""
    total_cost: Decimal
    cost_by_category: Dict[str, Decimal]
    cost_by_stop: Dict[str, Decimal]
    daily_average: Decimal
    most_expensive_day: Optional[date] = None
    budget_utilization: float = 0.0

class UserTripStatsSchema(Schema):
    """Schema for user's trip statistics"""
    total_trips: int
    total_destinations: int
    total_activities: int
    total_spent: Decimal
    average_trip_duration: float
    favorite_category: Optional[str] = None
    most_visited_country: Optional[str] = None
    upcoming_trips: int
    completed_trips: int

# Bulk Operations Schemas
class BulkActivityCreateSchema(Schema):
    """Schema for creating multiple activities"""
    activities: List[ActivityCreateSchema]

class BulkStopCreateSchema(Schema):
    """Schema for creating multiple stops"""
    stops: List[StopCreateSchema]

# Import/Export Schemas
class TripExportSchema(Schema):
    """Schema for trip export"""
    format: str = "json"  # json, pdf, csv
    include_activities: bool = True
    include_budget: bool = True
    include_notes: bool = True

class TripImportSchema(Schema):
    """Schema for trip import"""
    data: Dict[str, Any]
    source_format: str = "json"
    merge_with_existing: bool = False
