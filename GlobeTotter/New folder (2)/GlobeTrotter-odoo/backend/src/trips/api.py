from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from typing import List, Optional
from .models import (
    Trip, Stop, Activity, Budget, SharedItinerary, 
    TripCollaborator, TripTemplate, City, ActivityCatalog
)
from .schemas import (
    TripSchema, TripListSchema, TripCreateSchema, TripUpdateSchema,
    StopSchema, StopCreateSchema, StopUpdateSchema,
    ActivitySchema, ActivityCreateSchema, ActivityUpdateSchema,
    BudgetSchema, BudgetCreateSchema, BudgetUpdateSchema,
    SharedItinerarySchema, SharedItineraryCreateSchema, ShareResponseSchema,
    TripCollaboratorSchema, TripCollaboratorInviteSchema, TripCollaboratorUpdateSchema,
    TripTemplateSchema, TripTemplateCreateSchema,
    CitySchema, CityListSchema, CityCreateSchema, CityUpdateSchema,
    ActivityCatalogSchema, ActivityCatalogListSchema, ActivityCatalogCreateSchema,
    TripStatsSchema, UserTripStatsSchema,
    CitySearchSchema, ActivitySearchSchema, SearchFiltersSchema,
    BulkActivityCreateSchema, BulkStopCreateSchema,
    TripExportSchema, TripImportSchema
)
from authentication.schemas import MessageResponseSchema

trips_router = Router(tags=["Trip Management"])

# Trip CRUD endpoints
@trips_router.get("/trips", response=List[TripListSchema], auth=JWTAuth())
def list_trips(request, status: Optional[str] = None, is_public: Optional[bool] = None):
    """List all trips for the authenticated user"""
    trips = Trip.objects.filter(user=request.user).annotate(
        stops_count=Count('stops'),
        activities_count=Count('stops__activities')
    )
    
    if status:
        trips = trips.filter(status=status)
    if is_public is not None:
        trips = trips.filter(is_public=is_public)
    
    result = []
    for trip in trips:
        trip_data = {
            'id': trip.id,
            'name': trip.name,
            'description': trip.description,
            'start_date': trip.start_date,
            'end_date': trip.end_date,
            'cover_image': trip.cover_image,
            'status': trip.status,
            'estimated_budget': trip.estimated_budget,
            'currency': trip.currency,
            'stops_count': trip.stops_count,
            'activities_count': trip.activities_count,
            'duration_days': (trip.end_date - trip.start_date).days + 1,
            'created_at': trip.created_at
        }
        result.append(trip_data)
    
    return result

@trips_router.post("/trips", response=TripSchema, auth=JWTAuth())
def create_trip(request, payload: TripCreateSchema):
    """Create a new trip"""
    trip = Trip.objects.create(
        user=request.user,
        **payload.dict()
    )
    
    # Create default budget
    Budget.objects.create(trip=trip, currency=trip.currency)
    
    return get_trip_with_relations(trip)

@trips_router.get("/trips/{trip_id}", response=TripSchema, auth=JWTAuth())
def get_trip(request, trip_id: str):
    """Get trip details with all related data"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    return get_trip_with_relations(trip)

@trips_router.put("/trips/{trip_id}", response=TripSchema, auth=JWTAuth())
def update_trip(request, trip_id: str, payload: TripUpdateSchema):
    """Update trip details"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(trip, attr, value)
    
    trip.save()
    return get_trip_with_relations(trip)

@trips_router.delete("/trips/{trip_id}", auth=JWTAuth())
def delete_trip(request, trip_id: str):
    """Delete a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    trip.delete()
    return {"message": "Trip deleted successfully", "success": True}

# Trip sharing endpoints
@trips_router.post("/trips/{trip_id}/share", response=ShareResponseSchema, auth=JWTAuth())
def share_trip(request, trip_id: str, payload: SharedItineraryCreateSchema):
    """Generate public sharing link for a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    shared, created = SharedItinerary.objects.get_or_create(trip=trip)
    
    # Update sharing settings
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(shared, attr, value)
    shared.save()
    
    trip.is_public = True
    trip.save()
    
    return {
        "public_url": f"/public/{shared.public_slug}",
        "public_slug": shared.public_slug,
        "expires_at": shared.expires_at
    }

@trips_router.get("/trips/{trip_id}/stats", response=TripStatsSchema, auth=JWTAuth())
def get_trip_stats(request, trip_id: str):
    """Get detailed statistics for a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    budget = getattr(trip, 'budget', None)
    
    if not budget:
        return 400, {"message": "Trip budget not found", "success": False}
    
    # Calculate cost by category
    cost_by_category = {
        'transport': float(budget.transport_cost),
        'stay': float(budget.stay_cost),
        'activity': float(budget.activity_cost),
        'meal': float(budget.meal_cost),
        'shopping': float(budget.shopping_cost),
        'miscellaneous': float(budget.miscellaneous_cost)
    }
    
    # Calculate cost by stop
    cost_by_stop = {}
    for stop in trip.stops.all():
        stop_cost = float(stop.accommodation_cost or 0)
        for activity in stop.activities.all():
            stop_cost += float(activity.cost or 0)
        cost_by_stop[f"{stop.city_name}, {stop.country}"] = stop_cost
    
    # Calculate daily average
    total_cost = float(budget.total_cost)
    duration = (trip.end_date - trip.start_date).days + 1
    daily_average = total_cost / duration if duration > 0 else 0
    
    # Find most expensive day (simplified - could be enhanced)
    most_expensive_day = trip.start_date  # Placeholder
    
    # Calculate budget utilization
    budget_utilization = 0.0
    if budget.total_limit:
        budget_utilization = (total_cost / float(budget.total_limit)) * 100
    
    return {
        "total_cost": total_cost,
        "cost_by_category": cost_by_category,
        "cost_by_stop": cost_by_stop,
        "daily_average": daily_average,
        "most_expensive_day": most_expensive_day,
        "budget_utilization": budget_utilization
    }

# Helper function to get trip with all relations
def get_trip_with_relations(trip):
    """Helper function to serialize trip with all related data"""
    stops = trip.stops.all().annotate(activities_count=Count('activities'))
    budget = getattr(trip, 'budget', None)
    
    trip_data = {
        'id': trip.id,
        'name': trip.name,
        'description': trip.description,
        'start_date': trip.start_date,
        'end_date': trip.end_date,
        'cover_image': trip.cover_image,
        'is_public': trip.is_public,
        'status': trip.status,
        'estimated_budget': trip.estimated_budget,
        'actual_budget': trip.actual_budget,
        'currency': trip.currency,
        'collaborators_can_edit': trip.collaborators_can_edit,
        'auto_calculate_budget': trip.auto_calculate_budget,
        'created_at': trip.created_at,
        'updated_at': trip.updated_at,
        'stops': [get_stop_with_relations(stop) for stop in stops],
        'budget': {
            'id': budget.id,
            'transport_cost': budget.transport_cost,
            'stay_cost': budget.stay_cost,
            'activity_cost': budget.activity_cost,
            'meal_cost': budget.meal_cost,
            'shopping_cost': budget.shopping_cost,
            'miscellaneous_cost': budget.miscellaneous_cost,
            'transport_limit': budget.transport_limit,
            'stay_limit': budget.stay_limit,
            'activity_limit': budget.activity_limit,
            'meal_limit': budget.meal_limit,
            'shopping_limit': budget.shopping_limit,
            'miscellaneous_limit': budget.miscellaneous_limit,
            'currency': budget.currency,
            'total_cost': budget.total_cost,
            'total_limit': budget.total_limit,
            'is_over_budget': budget.is_over_budget,
            'created_at': budget.created_at,
            'updated_at': budget.updated_at
        } if budget else None,
        'stops_count': stops.count(),
        'activities_count': sum(stop.activities.count() for stop in stops),
        'duration_days': (trip.end_date - trip.start_date).days + 1
    }
    
    return trip_data

def get_stop_with_relations(stop):
    """Helper function to serialize stop with all related data"""
    activities = list(stop.activities.all())
    
    return {
        'id': stop.id,
        'city_name': stop.city_name,
        'country': stop.country,
        'start_date': stop.start_date,
        'end_date': stop.end_date,
        'order_index': stop.order_index,
        'latitude': stop.latitude,
        'longitude': stop.longitude,
        'timezone': stop.timezone,
        'notes': stop.notes,
        'accommodation_name': stop.accommodation_name,
        'accommodation_address': stop.accommodation_address,
        'accommodation_cost': stop.accommodation_cost,
        'activities': activities,
        'activities_count': len(activities),
        'duration_days': (stop.end_date - stop.start_date).days + 1,
        'created_at': stop.created_at,
        'updated_at': stop.updated_at
    }
