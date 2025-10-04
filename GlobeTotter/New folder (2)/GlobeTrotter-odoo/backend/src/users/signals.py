from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from users.models import UserProfile, UserPreferences

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """Create UserProfile when a new user is created"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_preferences(sender, instance, created, **kwargs):
    """Create UserPreferences when a new user is created"""
    if created:
        UserPreferences.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_preferences(sender, instance, **kwargs):
    """Save UserPreferences when user is saved"""
    if hasattr(instance, 'preferences'):
        instance.preferences.save()
