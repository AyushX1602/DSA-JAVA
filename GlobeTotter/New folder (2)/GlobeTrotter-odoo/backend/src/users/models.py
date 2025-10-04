import uuid
from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    """Extended user profile information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, max_length=500)
    website = models.URLField(blank=True)
    birth_date = models.DateField(null=True, blank=True)
    travel_style_preferences = models.JSONField(default=dict, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile for {self.user.email}"

class SavedDestination(models.Model):
    """User's saved/wishlist destinations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_destinations')
    city_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    priority = models.IntegerField(default=1, choices=[
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Must Visit')
    ])
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'saved_destinations'
        verbose_name = 'Saved Destination'
        verbose_name_plural = 'Saved Destinations'
        unique_together = ['user', 'city_name', 'country']
        ordering = ['-priority', '-saved_at']
    
    def __str__(self):
        return f"{self.city_name}, {self.country} - {self.user.email}"

class UserPreferences(models.Model):
    """User's travel preferences and settings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    
    # Currency preferences
    default_currency = models.CharField(max_length=5, default='USD')
    
    # Travel preferences
    budget_range = models.CharField(max_length=20, choices=[
        ('budget', 'Budget (Under $50/day)'),
        ('mid_range', 'Mid-range ($50-150/day)'),
        ('luxury', 'Luxury ($150+/day)'),
        ('flexible', 'Flexible')
    ], default='flexible')
    
    travel_style = models.CharField(max_length=20, choices=[
        ('adventure', 'Adventure'),
        ('relaxation', 'Relaxation'),
        ('culture', 'Cultural'),
        ('business', 'Business'),
        ('family', 'Family'),
        ('solo', 'Solo'),
        ('group', 'Group')
    ], default='adventure')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    trip_reminders = models.BooleanField(default=True)
    budget_alerts = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Privacy preferences
    profile_visibility = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('friends', 'Friends Only'),
        ('private', 'Private')
    ], default='public')
    
    trip_sharing_default = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('unlisted', 'Unlisted'),
        ('private', 'Private')
    ], default='private')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
