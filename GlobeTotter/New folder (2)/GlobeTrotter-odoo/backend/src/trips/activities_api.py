from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from typing import List
from datetime import timedelta
from .models import Stop, Activity
from .schemas import (
    ActivitySchema, ActivityCreateSchema, ActivityUpdateSchema,
    BulkActivityCreateSchema
)
from authentication.schemas import MessageResponseSchema

activities_router = Router(tags=["Activities"])

# Activity CRUD endpoints
@activities_router.get("/stops/{stop_id}/activities", response=List[ActivitySchema], auth=JWTAuth())
def list_activities(request, stop_id: str):
    """List all activities in a stop"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    return list(stop.activities.all())

@activities_router.post("/stops/{stop_id}/activities", response=ActivitySchema, auth=JWTAuth())
def create_activity(request, stop_id: str, payload: ActivityCreateSchema):
    """Create a new activity in a stop"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    
    activity = Activity.objects.create(
        stop=stop,
        **payload.dict()
    )
    
    return activity

@activities_router.get("/activities/{activity_id}", response=ActivitySchema, auth=JWTAuth())
def get_activity(request, activity_id: str):
    """Get activity details"""
    activity = get_object_or_404(Activity, id=activity_id, stop__trip__user=request.user)
    return activity

@activities_router.put("/activities/{activity_id}", response=ActivitySchema, auth=JWTAuth())
def update_activity(request, activity_id: str, payload: ActivityUpdateSchema):
    """Update activity details"""
    activity = get_object_or_404(Activity, id=activity_id, stop__trip__user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(activity, attr, value)
    
    activity.save()
    return activity

@activities_router.delete("/activities/{activity_id}", auth=JWTAuth())
def delete_activity(request, activity_id: str):
    """Delete an activity"""
    activity = get_object_or_404(Activity, id=activity_id, stop__trip__user=request.user)
    activity.delete()
    return {"message": "Activity deleted successfully", "success": True}

# Bulk operations for activities
@activities_router.post("/stops/{stop_id}/activities/bulk", response=List[ActivitySchema], auth=JWTAuth())
def bulk_create_activities(request, stop_id: str, payload: BulkActivityCreateSchema):
    """Create multiple activities at once"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    
    created_activities = []
    for activity_data in payload.activities:
        activity = Activity.objects.create(
            stop=stop,
            **activity_data.dict()
        )
        created_activities.append(activity)
    
    return created_activities

# Activity management endpoints
@activities_router.post("/activities/{activity_id}/book", response=ActivitySchema, auth=JWTAuth())
def book_activity(request, activity_id: str, booking_reference: str = ""):
    """Mark activity as booked"""
    activity = get_object_or_404(Activity, id=activity_id, stop__trip__user=request.user)
    
    activity.is_booked = True
    if booking_reference:
        activity.booking_reference = booking_reference
    activity.save()
    
    return activity

@activities_router.post("/activities/{activity_id}/pay", response=ActivitySchema, auth=JWTAuth())
def mark_activity_paid(request, activity_id: str):
    """Mark activity as paid"""
    activity = get_object_or_404(Activity, id=activity_id, stop__trip__user=request.user)
    
    activity.is_paid = True
    activity.save()
    
    return activity

@activities_router.get("/trips/{trip_id}/activities", response=List[ActivitySchema], auth=JWTAuth())
def list_trip_activities(request, trip_id: str, category: str = None):
    """List all activities in a trip, optionally filtered by category"""
    from .models import Trip
    
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    activities = Activity.objects.filter(stop__trip=trip)
    
    if category:
        activities = activities.filter(category=category)
    
    return list(activities.order_by('stop__order_index', 'start_time'))

@activities_router.get("/trips/{trip_id}/activities/by-date", response=dict, auth=JWTAuth())
def get_activities_by_date(request, trip_id: str):
    """Get activities grouped by date"""
    from .models import Trip
    from collections import defaultdict
    
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    activities_by_date = defaultdict(list)
    
    for stop in trip.stops.all():
        stop_date = stop.start_date
        for activity in stop.activities.all():
            activities_by_date[str(stop_date)].append({
                'id': activity.id,
                'name': activity.name,
                'category': activity.category,
                'start_time': activity.start_time,
                'end_time': activity.end_time,
                'cost': activity.cost,
                'location': f"{stop.city_name}, {stop.country}",
                'is_booked': activity.is_booked,
                'is_paid': activity.is_paid
            })
        
        # If stop spans multiple days, add activities to each day
        current_date = stop.start_date
        while current_date <= stop.end_date:
            if str(current_date) not in activities_by_date:
                activities_by_date[str(current_date)] = []
            current_date += timedelta(days=1)
    
    return dict(activities_by_date)

# Activity categories and filtering
@activities_router.get("/activities/categories", response=List[dict])
def get_activity_categories(request):
    """Get list of available activity categories"""
    from .models import Activity
    
    categories = [
        {'value': choice[0], 'label': choice[1]} 
        for choice in Activity.CATEGORY_CHOICES
    ]
    
    return categories
