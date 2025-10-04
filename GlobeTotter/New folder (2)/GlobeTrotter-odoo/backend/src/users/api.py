from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from typing import List
from .models import UserProfile, SavedDestination, UserPreferences
from .schemas import (
    UserProfileSchema, UserProfileCreateSchema, UserProfileUpdateSchema,
    SavedDestinationSchema, SavedDestinationCreateSchema, SavedDestinationUpdateSchema,
    UserPreferencesSchema, UserPreferencesCreateSchema, UserPreferencesUpdateSchema,
    CompleteUserProfileSchema, UserStatsSchema
)
from authentication.schemas import MessageResponseSchema

users_router = Router(tags=["User Management"])

# User Profile endpoints
@users_router.get("/profile", response=UserProfileSchema, auth=JWTAuth())
def get_user_profile(request):
    """Get current user's extended profile"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return profile

@users_router.put("/profile", response=UserProfileSchema, auth=JWTAuth())
def update_user_profile(request, payload: UserProfileUpdateSchema):
    """Update current user's extended profile"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(profile, attr, value)
    
    profile.save()
    return profile

# User Preferences endpoints
@users_router.get("/preferences", response=UserPreferencesSchema, auth=JWTAuth())
def get_user_preferences(request):
    """Get current user's preferences"""
    preferences, created = UserPreferences.objects.get_or_create(user=request.user)
    return preferences

@users_router.put("/preferences", response=UserPreferencesSchema, auth=JWTAuth())
def update_user_preferences(request, payload: UserPreferencesUpdateSchema):
    """Update current user's preferences"""
    preferences, created = UserPreferences.objects.get_or_create(user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(preferences, attr, value)
    
    preferences.save()
    return preferences

# Saved Destinations endpoints
@users_router.get("/saved-destinations", response=List[SavedDestinationSchema], auth=JWTAuth())
def list_saved_destinations(request):
    """List current user's saved destinations"""
    return list(request.user.saved_destinations.all())

@users_router.post("/saved-destinations", response=SavedDestinationSchema, auth=JWTAuth())
def create_saved_destination(request, payload: SavedDestinationCreateSchema):
    """Add a destination to user's wishlist"""
    destination = SavedDestination.objects.create(
        user=request.user,
        **payload.dict()
    )
    return destination

@users_router.get("/saved-destinations/{destination_id}", response=SavedDestinationSchema, auth=JWTAuth())
def get_saved_destination(request, destination_id: str):
    """Get a specific saved destination"""
    destination = get_object_or_404(SavedDestination, id=destination_id, user=request.user)
    return destination

@users_router.put("/saved-destinations/{destination_id}", response=SavedDestinationSchema, auth=JWTAuth())
def update_saved_destination(request, destination_id: str, payload: SavedDestinationUpdateSchema):
    """Update a saved destination"""
    destination = get_object_or_404(SavedDestination, id=destination_id, user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(destination, attr, value)
    
    destination.save()
    return destination

@users_router.delete("/saved-destinations/{destination_id}", auth=JWTAuth())
def delete_saved_destination(request, destination_id: str):
    """Remove a destination from user's wishlist"""
    destination = get_object_or_404(SavedDestination, id=destination_id, user=request.user)
    destination.delete()
    return {"message": "Destination removed from wishlist", "success": True}

# Complete user profile with all related data
@users_router.get("/complete-profile", response=CompleteUserProfileSchema, auth=JWTAuth())
def get_complete_profile(request):
    """Get complete user profile with all related data"""
    user = request.user
    profile = getattr(user, 'profile', None)
    preferences = getattr(user, 'preferences', None)
    saved_destinations = list(user.saved_destinations.all())
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "photo_url": user.photo_url,
        "language_pref": user.language_pref,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "profile": profile,
        "preferences": preferences,
        "saved_destinations": saved_destinations,
        "saved_destinations_count": len(saved_destinations)
    }

# User statistics
@users_router.get("/stats", response=UserStatsSchema, auth=JWTAuth())
def get_user_stats(request):
    """Get user's travel statistics"""
    user = request.user
    trips = user.trips.all()
    
    total_trips = trips.count()
    completed_trips = trips.filter(status='completed')
    
    # Calculate total destinations visited
    total_destinations = 0
    total_activities = 0
    total_budget_spent = 0
    
    for trip in completed_trips:
        total_destinations += trip.stops.count()
        for stop in trip.stops.all():
            total_activities += stop.activities.count()
        
        if hasattr(trip, 'budget'):
            total_budget_spent += float(trip.budget.total_cost)
    
    # Calculate average trip duration
    total_duration = sum((trip.end_date - trip.start_date).days + 1 for trip in completed_trips)
    avg_duration = total_duration / completed_trips.count() if completed_trips.count() > 0 else 0
    
    # Find favorite destination (most visited country)
    country_counts = {}
    for trip in completed_trips:
        for stop in trip.stops.all():
            country_counts[stop.country] = country_counts.get(stop.country, 0) + 1
    
    favorite_destination = max(country_counts.items(), key=lambda x: x[1])[0] if country_counts else None
    
    # Find most expensive trip
    most_expensive_trip = None
    max_cost = 0
    for trip in completed_trips:
        if hasattr(trip, 'budget') and trip.budget.total_cost > max_cost:
            max_cost = trip.budget.total_cost
            most_expensive_trip = trip.name
    
    return {
        "total_trips": total_trips,
        "total_destinations_visited": total_destinations,
        "total_activities": total_activities,
        "total_budget_spent": total_budget_spent,
        "favorite_destination": favorite_destination,
        "average_trip_duration": avg_duration,
        "most_expensive_trip": most_expensive_trip
    }
