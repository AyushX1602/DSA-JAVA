from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from django.db.models import Count
from typing import List
from .models import Trip, Stop, Activity
from .schemas import (
    StopSchema, StopCreateSchema, StopUpdateSchema,
    ActivitySchema, ActivityCreateSchema, ActivityUpdateSchema,
    BulkStopCreateSchema
)
from authentication.schemas import MessageResponseSchema

stops_router = Router(tags=["Trip Stops"])

# Stop CRUD endpoints
@stops_router.get("/trips/{trip_id}/stops", response=List[StopSchema], auth=JWTAuth())
def list_stops(request, trip_id: str):
    """List all stops in a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    stops = trip.stops.all().annotate(activities_count=Count('activities'))
    
    result = []
    for stop in stops:
        stop_data = {
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
            'activities': list(stop.activities.all()),
            'activities_count': stop.activities_count,
            'duration_days': (stop.end_date - stop.start_date).days + 1,
            'created_at': stop.created_at,
            'updated_at': stop.updated_at
        }
        result.append(stop_data)
    
    return result

@stops_router.post("/trips/{trip_id}/stops", response=StopSchema, auth=JWTAuth())
def create_stop(request, trip_id: str, payload: StopCreateSchema):
    """Create a new stop in a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    stop = Stop.objects.create(
        trip=trip,
        **payload.dict()
    )
    
    return get_stop_with_activities(stop)

@stops_router.get("/stops/{stop_id}", response=StopSchema, auth=JWTAuth())
def get_stop(request, stop_id: str):
    """Get stop details with all activities"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    return get_stop_with_activities(stop)

@stops_router.put("/stops/{stop_id}", response=StopSchema, auth=JWTAuth())
def update_stop(request, stop_id: str, payload: StopUpdateSchema):
    """Update stop details"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(stop, attr, value)
    
    stop.save()
    return get_stop_with_activities(stop)

@stops_router.delete("/stops/{stop_id}", auth=JWTAuth())
def delete_stop(request, stop_id: str):
    """Delete a stop"""
    stop = get_object_or_404(Stop, id=stop_id, trip__user=request.user)
    stop.delete()
    return {"message": "Stop deleted successfully", "success": True}

# Bulk operations for stops
@stops_router.post("/trips/{trip_id}/stops/bulk", response=List[StopSchema], auth=JWTAuth())
def bulk_create_stops(request, trip_id: str, payload: BulkStopCreateSchema):
    """Create multiple stops at once"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    created_stops = []
    for stop_data in payload.stops:
        stop = Stop.objects.create(
            trip=trip,
            **stop_data.dict()
        )
        created_stops.append(get_stop_with_activities(stop))
    
    return created_stops

# Reorder stops
@stops_router.post("/trips/{trip_id}/stops/reorder", response=List[StopSchema], auth=JWTAuth())
def reorder_stops(request, trip_id: str, stop_orders: List[dict]):
    """Reorder stops in a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    
    # Update order_index for each stop
    for order_data in stop_orders:
        stop_id = order_data.get('stop_id')
        new_order = order_data.get('order_index')
        
        if stop_id and new_order is not None:
            Stop.objects.filter(
                id=stop_id, 
                trip=trip
            ).update(order_index=new_order)
    
    # Return updated stops list
    stops = trip.stops.all().order_by('order_index')
    return [get_stop_with_activities(stop) for stop in stops]

def get_stop_with_activities(stop):
    """Helper function to serialize stop with activities"""
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
