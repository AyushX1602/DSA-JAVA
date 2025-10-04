from django.apps import AppConfig


class TripsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trips"
    verbose_name = "Trip Management"
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import trips.signals  # noqa F401
        except ImportError:
            pass
