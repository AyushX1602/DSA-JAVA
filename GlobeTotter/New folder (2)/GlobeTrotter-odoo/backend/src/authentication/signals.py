from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

# Auth app signals can be used for user-related events
# For now, this is a placeholder for any auth-specific signals

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def user_created(sender, instance, created, **kwargs):
    """Handle user creation events"""
    if created:
        # Log user creation or send welcome emails
        print(f"New user created: {instance.email}")

# Additional auth-related signals can be added here as needed
