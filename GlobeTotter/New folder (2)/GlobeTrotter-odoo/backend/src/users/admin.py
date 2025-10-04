from django.contrib import admin
from .models import UserProfile, SavedDestination, UserPreferences

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model"""
    list_display = ('user_email', 'website', 'birth_date', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile Information', {
            'fields': ('bio', 'website', 'birth_date')
        }),
        ('Preferences', {
            'fields': ('travel_style_preferences', 'notification_preferences'),
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

@admin.register(SavedDestination)
class SavedDestinationAdmin(admin.ModelAdmin):
    """Admin configuration for SavedDestination model"""
    list_display = ('user_email', 'city_name', 'country', 'priority', 'saved_at')
    list_filter = ('priority', 'country', 'saved_at')
    search_fields = ('user__email', 'city_name', 'country', 'notes')
    ordering = ('-saved_at',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Destination', {
            'fields': ('city_name', 'country', 'priority', 'notes')
        }),
        ('Timestamp', {
            'fields': ('saved_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('saved_at',)
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'

@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    """Admin configuration for UserPreferences model"""
    list_display = ('user_email', 'default_currency', 'budget_range', 'travel_style', 'profile_visibility')
    list_filter = ('default_currency', 'budget_range', 'travel_style', 'profile_visibility', 'trip_sharing_default')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Currency & Budget', {
            'fields': ('default_currency', 'budget_range')
        }),
        ('Travel Preferences', {
            'fields': ('travel_style',)
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'trip_reminders', 'budget_alerts', 'marketing_emails'),
            'classes': ('collapse',)
        }),
        ('Privacy', {
            'fields': ('profile_visibility', 'trip_sharing_default'),
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
