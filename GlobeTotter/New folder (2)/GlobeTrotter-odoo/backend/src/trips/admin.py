from django.contrib import admin
from django.utils.html import format_html
from .models import Trip, Stop, Activity, Budget, SharedItinerary, TripCollaborator, TripTemplate, City, ActivityCatalog

class ActivityInline(admin.TabularInline):
    """Inline admin for activities within stops"""
    model = Activity
    extra = 0
    fields = ('name', 'category', 'start_time', 'end_time', 'cost', 'priority', 'is_booked')
    readonly_fields = ('created_at',)

class StopInline(admin.TabularInline):
    """Inline admin for stops within trips"""
    model = Stop
    extra = 0
    fields = ('city_name', 'country', 'start_date', 'end_date', 'order_index')
    readonly_fields = ('created_at',)

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Admin configuration for Trip model"""
    list_display = ('name', 'user_email', 'start_date', 'end_date', 'status', 'is_public', 'stops_count', 'created_at')
    list_filter = ('status', 'is_public', 'currency', 'created_at', 'start_date')
    search_fields = ('name', 'description', 'user__email', 'user__name')
    ordering = ('-created_at',)
    inlines = [StopInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'description', 'cover_image')
        }),
        ('Dates & Status', {
            'fields': ('start_date', 'end_date', 'status')
        }),
        ('Budget', {
            'fields': ('estimated_budget', 'actual_budget', 'currency'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('is_public', 'collaborators_can_edit', 'auto_calculate_budget'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def stops_count(self, obj):
        return obj.stops.count()
    stops_count.short_description = 'Stops'

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    """Admin configuration for Stop model"""
    list_display = ('city_name', 'country', 'trip_name', 'start_date', 'end_date', 'order_index', 'activities_count')
    list_filter = ('country', 'start_date', 'created_at')
    search_fields = ('city_name', 'country', 'trip__name', 'notes')
    ordering = ('trip', 'order_index', 'start_date')
    inlines = [ActivityInline]
    
    fieldsets = (
        ('Trip', {'fields': ('trip',)}),
        ('Location', {
            'fields': ('city_name', 'country', 'latitude', 'longitude', 'timezone')
        }),
        ('Dates & Order', {
            'fields': ('start_date', 'end_date', 'order_index')
        }),
        ('Accommodation', {
            'fields': ('accommodation_name', 'accommodation_address', 'accommodation_cost'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def trip_name(self, obj):
        return obj.trip.name
    trip_name.short_description = 'Trip'
    trip_name.admin_order_field = 'trip__name'
    
    def activities_count(self, obj):
        return obj.activities.count()
    activities_count.short_description = 'Activities'

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    """Admin configuration for Activity model"""
    list_display = ('name', 'category', 'stop_city', 'trip_name', 'start_time', 'cost', 'priority', 'is_booked')
    list_filter = ('category', 'priority', 'is_booked', 'is_paid', 'weather_dependent', 'indoor_activity', 'created_at')
    search_fields = ('name', 'description', 'location_name', 'stop__city_name', 'stop__trip__name')
    ordering = ('stop', 'start_time', 'name')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('stop', 'name', 'category', 'description', 'notes')
        }),
        ('Location & Contact', {
            'fields': ('location_name', 'address', 'website_url', 'phone_number'),
            'classes': ('collapse',)
        }),
        ('Timing', {
            'fields': ('start_time', 'end_time', 'duration_minutes')
        }),
        ('Cost & Booking', {
            'fields': ('cost', 'currency', 'is_paid', 'is_booked', 'booking_reference'),
            'classes': ('collapse',)
        }),
        ('Preferences', {
            'fields': ('priority', 'weather_dependent', 'indoor_activity'),
            'classes': ('collapse',)
        }),
        ('Media', {
            'fields': ('image_url',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def stop_city(self, obj):
        return f"{obj.stop.city_name}, {obj.stop.country}"
    stop_city.short_description = 'Stop'
    stop_city.admin_order_field = 'stop__city_name'
    
    def trip_name(self, obj):
        return obj.stop.trip.name
    trip_name.short_description = 'Trip'
    trip_name.admin_order_field = 'stop__trip__name'

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    """Admin configuration for Budget model"""
    list_display = ('trip_name', 'total_cost', 'total_limit', 'is_over_budget', 'currency', 'updated_at')
    list_filter = ('currency', 'created_at', 'updated_at')
    search_fields = ('trip__name', 'trip__user__email')
    ordering = ('-updated_at',)
    
    fieldsets = (
        ('Trip', {'fields': ('trip',)}),
        ('Costs', {
            'fields': ('transport_cost', 'stay_cost', 'activity_cost', 'meal_cost', 'shopping_cost', 'miscellaneous_cost')
        }),
        ('Limits', {
            'fields': ('transport_limit', 'stay_limit', 'activity_limit', 'meal_limit', 'shopping_limit', 'miscellaneous_limit'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('currency',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def trip_name(self, obj):
        return obj.trip.name
    trip_name.short_description = 'Trip'
    trip_name.admin_order_field = 'trip__name'
    
    def is_over_budget(self, obj):
        if obj.is_over_budget:
            return format_html('<span style="color: red;">Yes</span>')
        return format_html('<span style="color: green;">No</span>')
    is_over_budget.short_description = 'Over Budget'

@admin.register(SharedItinerary)
class SharedItineraryAdmin(admin.ModelAdmin):
    """Admin configuration for SharedItinerary model"""
    list_display = ('trip_name', 'public_slug', 'view_count', 'copy_count', 'allow_comments', 'allow_copying', 'created_at')
    list_filter = ('allow_comments', 'allow_copying', 'password_protected', 'created_at')
    search_fields = ('trip__name', 'public_slug', 'trip__user__email')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Trip', {'fields': ('trip',)}),
        ('Sharing Settings', {
            'fields': ('public_slug', 'allow_comments', 'allow_copying', 'password_protected', 'access_password')
        }),
        ('Analytics', {
            'fields': ('view_count', 'copy_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('view_count', 'copy_count', 'created_at')
    
    def trip_name(self, obj):
        return obj.trip.name
    trip_name.short_description = 'Trip'
    trip_name.admin_order_field = 'trip__name'

@admin.register(TripCollaborator)
class TripCollaboratorAdmin(admin.ModelAdmin):
    """Admin configuration for TripCollaborator model"""
    list_display = ('trip_name', 'user_email', 'permission_level', 'status', 'invited_by_email', 'invited_at')
    list_filter = ('permission_level', 'status', 'invited_at')
    search_fields = ('trip__name', 'user__email', 'invited_by__email')
    ordering = ('-invited_at',)
    
    fieldsets = (
        ('Trip & User', {
            'fields': ('trip', 'user', 'invited_by')
        }),
        ('Permissions', {
            'fields': ('permission_level', 'status')
        }),
        ('Timestamps', {
            'fields': ('invited_at', 'responded_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('invited_at', 'responded_at')
    
    def trip_name(self, obj):
        return obj.trip.name
    trip_name.short_description = 'Trip'
    trip_name.admin_order_field = 'trip__name'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    user_email.admin_order_field = 'user__email'
    
    def invited_by_email(self, obj):
        return obj.invited_by.email
    invited_by_email.short_description = 'Invited By'
    invited_by_email.admin_order_field = 'invited_by__email'

@admin.register(TripTemplate)
class TripTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for TripTemplate model"""
    list_display = ('name', 'category', 'duration_days', 'difficulty_level', 'use_count', 'is_public', 'created_by_email')
    list_filter = ('category', 'difficulty_level', 'is_public', 'duration_days', 'created_at')
    search_fields = ('name', 'description', 'category', 'created_by__email')
    ordering = ('-use_count', '-created_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('created_by', 'name', 'description', 'category')
        }),
        ('Template Details', {
            'fields': ('duration_days', 'estimated_budget', 'difficulty_level')
        }),
        ('Template Data', {
            'fields': ('template_data',),
            'classes': ('collapse',)
        }),
        ('Sharing & Usage', {
            'fields': ('is_public', 'use_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('use_count', 'created_at', 'updated_at')
    
    def created_by_email(self, obj):
        return obj.created_by.email
    created_by_email.short_description = 'Created By'
    created_by_email.admin_order_field = 'created_by__email'

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    """Admin configuration for City model"""
    list_display = ('name', 'country', 'country_code', 'cost_level', 'safety_rating', 'popular_attractions_count', 'updated_at')
    list_filter = ('country', 'cost_level', 'safety_rating', 'country_code', 'created_at')
    search_fields = ('name', 'country', 'country_code', 'description')
    ordering = ('country', 'name')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'country', 'country_code')
        }),
        ('Geographic Data', {
            'fields': ('latitude', 'longitude', 'timezone', 'population'),
            'classes': ('collapse',)
        }),
        ('City Information', {
            'fields': ('currency', 'language', 'description', 'best_time_to_visit', 'average_temperature')
        }),
        ('Travel Information', {
            'fields': ('safety_rating', 'cost_level', 'popular_attractions', 'travel_tips', 'transport_options'),
            'classes': ('collapse',)
        }),
        ('Media & Weather', {
            'fields': ('image_url', 'weather_info'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def popular_attractions_count(self, obj):
        return obj.popular_attractions_count
    popular_attractions_count.short_description = 'Attractions Count'

@admin.register(ActivityCatalog)
class ActivityCatalogAdmin(admin.ModelAdmin):
    """Admin configuration for ActivityCatalog model"""
    list_display = ('name', 'category', 'city_country', 'average_cost', 'currency', 'rating', 'review_count', 'is_verified')
    list_filter = ('category', 'country', 'difficulty_level', 'booking_required', 'is_verified', 'season_availability', 'created_at')
    search_fields = ('name', 'description', 'city_name', 'country', 'location_name', 'tags')
    ordering = ('-rating', '-review_count', 'name')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description')
        }),
        ('Location', {
            'fields': ('city_name', 'country', 'location_name', 'address', 'latitude', 'longitude')
        }),
        ('Cost Information', {
            'fields': ('average_cost', 'cost_range_min', 'cost_range_max', 'currency'),
            'classes': ('collapse',)
        }),
        ('Activity Details', {
            'fields': ('estimated_duration_minutes', 'difficulty_level', 'age_restriction', 'group_size_min', 'group_size_max'),
            'classes': ('collapse',)
        }),
        ('Availability', {
            'fields': ('season_availability', 'operating_hours'),
            'classes': ('collapse',)
        }),
        ('Contact Information', {
            'fields': ('website_url', 'phone_number', 'email'),
            'classes': ('collapse',)
        }),
        ('Booking Information', {
            'fields': ('booking_required', 'advance_booking_days', 'cancellation_policy'),
            'classes': ('collapse',)
        }),
        ('Reviews & Ratings', {
            'fields': ('rating', 'review_count', 'popular_times'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('accessibility_features', 'included_amenities', 'what_to_bring', 'safety_guidelines'),
            'classes': ('collapse',)
        }),
        ('Media & Tags', {
            'fields': ('image_urls', 'video_url', 'tags', 'is_verified'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('last_updated', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('last_updated', 'created_at')
    
    def city_country(self, obj):
        return f"{obj.city_name}, {obj.country}"
    city_country.short_description = 'Location'
    city_country.admin_order_field = 'city_name'
