import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class Trip(models.Model):
    """Main trip model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    cover_image = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    
    # Trip status
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    # Trip metadata
    estimated_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=5, default='USD')
    
    # Trip settings
    collaborators_can_edit = models.BooleanField(default=False)
    auto_calculate_budget = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trips'
        ordering = ['-created_at']
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
    
    def __str__(self):
        return f"{self.name} by {self.user.email}"
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1
    
    @property
    def stops_count(self):
        return self.stops.count()
    
    @property
    def activities_count(self):
        return sum(stop.activities.count() for stop in self.stops.all())

class Stop(models.Model):
    """Trip stops/destinations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    city_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    order_index = models.IntegerField(default=0)
    
    # Location details
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    
    # Stop details
    notes = models.TextField(blank=True)
    accommodation_name = models.CharField(max_length=200, blank=True)
    accommodation_address = models.TextField(blank=True)
    accommodation_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stops'
        ordering = ['order_index', 'start_date']
        verbose_name = 'Stop'
        verbose_name_plural = 'Stops'
    
    def __str__(self):
        return f"{self.city_name}, {self.country}"
    
    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1
    
    @property
    def activities_count(self):
        return self.activities.count()

class Activity(models.Model):
    """Activities within each stop"""
    CATEGORY_CHOICES = [
        ('sightseeing', 'Sightseeing'),
        ('food', 'Food & Dining'),
        ('adventure', 'Adventure'),
        ('culture', 'Culture & Arts'),
        ('nightlife', 'Nightlife'),
        ('shopping', 'Shopping'),
        ('nature', 'Nature & Outdoors'),
        ('transport', 'Transportation'),
        ('accommodation', 'Accommodation'),
        ('relaxation', 'Relaxation & Spa'),
        ('sports', 'Sports & Recreation'),
        ('business', 'Business'),
        ('education', 'Educational'),
        ('other', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'), 
        (3, 'High'),
        (4, 'Must Do')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    
    # Activity details
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    location_name = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    
    # Timing
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)
    
    # Cost
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=5, default='USD')
    is_paid = models.BooleanField(default=False)
    
    # Activity metadata
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    is_booked = models.BooleanField(default=False)
    booking_reference = models.CharField(max_length=100, blank=True)
    website_url = models.URLField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Media
    image_url = models.URLField(blank=True, null=True)
    
    # Weather consideration
    weather_dependent = models.BooleanField(default=False)
    indoor_activity = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'activities'
        ordering = ['start_time', 'priority', 'name']
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.name} in {self.stop.city_name}"

class Budget(models.Model):
    """Budget tracking for trips"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='budget')
    
    # Budget categories
    transport_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    stay_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    activity_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    meal_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    shopping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    miscellaneous_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Budget limits (optional)
    transport_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stay_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    activity_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    meal_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    shopping_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    miscellaneous_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    currency = models.CharField(max_length=5, default='USD')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
    
    @property
    def total_cost(self):
        return (self.transport_cost + self.stay_cost + self.activity_cost + 
                self.meal_cost + self.shopping_cost + self.miscellaneous_cost)
    
    @property
    def total_limit(self):
        limits = [self.transport_limit, self.stay_limit, self.activity_limit,
                 self.meal_limit, self.shopping_limit, self.miscellaneous_limit]
        return sum(limit for limit in limits if limit is not None)
    
    @property
    def is_over_budget(self):
        if self.total_limit:
            return self.total_cost > self.total_limit
        return False
    
    def __str__(self):
        return f"Budget for {self.trip.name}"

class SharedItinerary(models.Model):
    """Public sharing for itineraries"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='shared_itinerary')
    public_slug = models.CharField(max_length=255, unique=True)
    
    # Sharing settings
    allow_comments = models.BooleanField(default=True)
    allow_copying = models.BooleanField(default=True)
    password_protected = models.BooleanField(default=False)
    access_password = models.CharField(max_length=100, blank=True)
    
    # Analytics
    view_count = models.IntegerField(default=0)
    copy_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'shared_itineraries'
        verbose_name = 'Shared Itinerary'
        verbose_name_plural = 'Shared Itineraries'
    
    def save(self, *args, **kwargs):
        if not self.public_slug:
            base_slug = slugify(self.trip.name)
            random_suffix = secrets.token_urlsafe(8)
            self.public_slug = f"{base_slug}-{random_suffix}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Shared: {self.trip.name}"

class TripCollaborator(models.Model):
    """Collaborators for trip planning"""
    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('comment', 'View & Comment'),
        ('edit', 'View & Edit'),
        ('admin', 'Full Access')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='collaborators')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='collaborated_trips')
    permission_level = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='view')
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invitations')
    
    # Invitation status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('revoked', 'Revoked')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    invited_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'trip_collaborators'
        unique_together = ['trip', 'user']
        verbose_name = 'Trip Collaborator'
        verbose_name_plural = 'Trip Collaborators'
    
    def __str__(self):
        return f"{self.user.email} - {self.trip.name} ({self.permission_level})"

class TripTemplate(models.Model):
    """Templates for creating trips quickly"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_templates')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    
    # Template data (JSON structure of stops and activities)
    template_data = models.JSONField(default=dict)
    
    # Template metadata
    duration_days = models.IntegerField()
    estimated_budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
        ('expert', 'Expert')
    ], default='moderate')
    
    # Sharing
    is_public = models.BooleanField(default=False)
    use_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trip_templates'
        ordering = ['-use_count', '-created_at']
        verbose_name = 'Trip Template'
        verbose_name_plural = 'Trip Templates'
    
    def __str__(self):
        return f"Template: {self.name}"

class City(models.Model):
    """City master data for travel planning"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    country_code = models.CharField(max_length=3)  # ISO country code
    
    # Geographic data
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    timezone = models.CharField(max_length=50, blank=True)
    
    # City information
    population = models.IntegerField(null=True, blank=True)
    currency = models.CharField(max_length=5, blank=True)
    language = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    best_time_to_visit = models.TextField(blank=True)
    average_temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Travel information
    popular_attractions = models.JSONField(default=list, blank=True)
    travel_tips = models.JSONField(default=list, blank=True)
    safety_rating = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    cost_level = models.CharField(max_length=20, choices=[
        ('budget', 'Budget'),
        ('moderate', 'Moderate'),
        ('expensive', 'Expensive'),
        ('luxury', 'Luxury')
    ], null=True, blank=True)
    
    # Media
    image_url = models.URLField(blank=True, null=True)
    weather_info = models.JSONField(default=dict, blank=True)
    transport_options = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cities'
        unique_together = ['name', 'country']
        ordering = ['country', 'name']
        verbose_name = 'City'
        verbose_name_plural = 'Cities'
    
    def __str__(self):
        return f"{self.name}, {self.country}"
    
    @property
    def popular_attractions_count(self):
        return len(self.popular_attractions) if self.popular_attractions else 0

class ActivityCatalog(models.Model):
    """Catalog of activities available in different cities"""
    CATEGORY_CHOICES = [
        ('sightseeing', 'Sightseeing'),
        ('food', 'Food & Dining'),
        ('adventure', 'Adventure'),
        ('culture', 'Culture & Arts'),
        ('nightlife', 'Nightlife'),
        ('shopping', 'Shopping'),
        ('nature', 'Nature & Outdoors'),
        ('transport', 'Transportation'),
        ('accommodation', 'Accommodation'),
        ('relaxation', 'Relaxation & Spa'),
        ('sports', 'Sports & Recreation'),
        ('business', 'Business'),
        ('education', 'Educational'),
        ('entertainment', 'Entertainment'),
        ('tours', 'Tours & Experiences'),
        ('other', 'Other'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
        ('expert', 'Expert')
    ]
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('fall', 'Fall'),
        ('winter', 'Winter'),
        ('year_round', 'Year Round')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    
    # Location
    city_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    location_name = models.CharField(max_length=200, blank=True)
    address = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Cost information
    average_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=5, default='USD')
    
    # Activity details
    estimated_duration_minutes = models.IntegerField(null=True, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, null=True, blank=True)
    age_restriction = models.IntegerField(null=True, blank=True)
    group_size_min = models.IntegerField(null=True, blank=True)
    group_size_max = models.IntegerField(null=True, blank=True)
    
    # Availability
    season_availability = models.JSONField(default=list, blank=True)
    operating_hours = models.JSONField(default=dict, blank=True)
    
    # Contact information
    website_url = models.URLField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    
    # Booking information
    booking_required = models.BooleanField(default=False)
    advance_booking_days = models.IntegerField(null=True, blank=True)
    cancellation_policy = models.TextField(blank=True)
    
    # Reviews and ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True,
                                validators=[MinValueValidator(0), MaxValueValidator(5)])
    review_count = models.IntegerField(default=0)
    popular_times = models.JSONField(default=dict, blank=True)
    
    # Additional information
    accessibility_features = models.JSONField(default=list, blank=True)
    included_amenities = models.JSONField(default=list, blank=True)
    what_to_bring = models.JSONField(default=list, blank=True)
    safety_guidelines = models.JSONField(default=list, blank=True)
    
    # Media
    image_urls = models.JSONField(default=list, blank=True)
    video_url = models.URLField(blank=True, null=True)
    
    # Tags and verification
    tags = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=False)
    
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_catalog'
        ordering = ['-rating', '-review_count', 'name']
        verbose_name = 'Activity Catalog'
        verbose_name_plural = 'Activity Catalog'
        indexes = [
            models.Index(fields=['city_name', 'country']),
            models.Index(fields=['category']),
            models.Index(fields=['rating']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.name} in {self.city_name}, {self.country}"
    
    @property
    def location_display(self):
        return f"{self.city_name}, {self.country}"
    
    @property
    def cost_range_display(self):
        if self.cost_range_min and self.cost_range_max:
            return f"{self.cost_range_min} - {self.cost_range_max} {self.currency}"
        elif self.average_cost:
            return f"~{self.average_cost} {self.currency}"
        return "Price not available"
