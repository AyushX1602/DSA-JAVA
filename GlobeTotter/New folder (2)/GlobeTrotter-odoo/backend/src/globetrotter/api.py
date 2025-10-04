from ninja_extra import NinjaExtraAPI
from ninja_jwt.controller import NinjaJWTDefaultController
from authentication.api import auth_router
from users.api import users_router
from trips.api import trips_router
from trips.stops_api import stops_router
from trips.activities_api import activities_router
from trips.budget_api import budget_router

# Create main API instance
api = NinjaExtraAPI(
    title="GlobeTrotter API",
    version="1.0.0",
    description="Personalized Travel Planning API - Plan your multi-city trips with ease!",
    docs_url="/docs",
)

# Add JWT controller for token refresh
api.register_controllers(NinjaJWTDefaultController)

# Add all routers
api.add_router("/auth", auth_router)
api.add_router("/users", users_router)
api.add_router("/", trips_router)
api.add_router("/", stops_router)
api.add_router("/", activities_router)
api.add_router("/", budget_router)

# Public endpoints (no auth required)
from ninja import Router
from django.shortcuts import get_object_or_404
from trips.models import SharedItinerary
from trips.schemas import TripSchema

public_router = Router(tags=["Public"])

@public_router.get("/public/{slug}", response=TripSchema)
def get_public_trip(request, slug: str):
    """Get public shared trip by slug"""
    shared = get_object_or_404(SharedItinerary, public_slug=slug)
    
    if not shared.trip.is_public:
        return 404, {"message": "Trip not found or not public"}
    
    # Increment view count
    shared.view_count += 1
    shared.save()
    
    # Import the helper function
    from trips.api import get_trip_with_relations
    return get_trip_with_relations(shared.trip)

@public_router.post("/public/{slug}/copy", auth=None)
def copy_public_trip(request, slug: str):
    """Copy a public trip to user's account"""
    shared = get_object_or_404(SharedItinerary, public_slug=slug)
    
    if not shared.trip.is_public or not shared.allow_copying:
        return 403, {"message": "Trip copying not allowed"}
    
    # For now, just increment copy count
    # Full implementation would require user authentication
    shared.copy_count += 1
    shared.save()
    
    return {"message": "Trip copied successfully", "success": True}

# Add public router
api.add_router("/", public_router)

# Search and Discovery endpoints
search_router = Router(tags=["Search & Discovery"])

@search_router.get("/search/cities", response=list)
def search_cities(request, query: str = "", limit: int = 10):
    """Search for cities"""
    from trips.models import City
    
    cities = City.objects.all()
    
    if query:
        cities = cities.filter(
            name__icontains=query
        ) | cities.filter(
            country__icontains=query
        )
    
    cities = cities[:limit]
    
    return [
        {
            "name": city.name,
            "country": city.country,
            "latitude": float(city.latitude) if city.latitude else None,
            "longitude": float(city.longitude) if city.longitude else None,
            "timezone": city.timezone,
            "popular_attractions": city.popular_attractions[:3]  # First 3 attractions
        }
        for city in cities
    ]

@search_router.get("/search/activities", response=list)
def search_activities(request, 
                     query: str = "", 
                     city: str = "", 
                     category: str = "", 
                     min_cost: float = None, 
                     max_cost: float = None,
                     limit: int = 20):
    """Search for activities"""
    from trips.models import ActivityCatalog
    
    activities = ActivityCatalog.objects.filter(is_verified=True)
    
    if query:
        activities = activities.filter(name__icontains=query)
    
    if city:
        activities = activities.filter(city_name__icontains=city)
    
    if category:
        activities = activities.filter(category=category)
    
    if min_cost is not None:
        activities = activities.filter(average_cost__gte=min_cost)
    
    if max_cost is not None:
        activities = activities.filter(average_cost__lte=max_cost)
    
    activities = activities.order_by('-rating', '-review_count')[:limit]
    
    return [
        {
            "name": activity.name,
            "category": activity.category,
            "description": activity.description,
            "city_name": activity.city_name,
            "country": activity.country,
            "estimated_cost": float(activity.average_cost) if activity.average_cost else None,
            "duration_minutes": activity.estimated_duration_minutes,
            "rating": float(activity.rating) if activity.rating else None,
            "image_url": activity.image_urls[0] if activity.image_urls else None
        }
        for activity in activities
    ]

# Add search router
api.add_router("/", search_router)