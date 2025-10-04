from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Trip, Budget, Activity, Stop

@receiver(post_save, sender=Trip)
def create_trip_budget(sender, instance, created, **kwargs):
    """Create Budget when a new trip is created"""
    if created:
        Budget.objects.create(trip=instance, currency=instance.currency)

@receiver(post_save, sender=Activity)
def update_trip_budget_on_activity_save(sender, instance, **kwargs):
    """Update trip budget when activity cost changes"""
    if instance.cost and instance.stop.trip.auto_calculate_budget:
        budget = instance.stop.trip.budget
        # Recalculate activity costs for the trip
        total_activity_cost = sum(
            activity.cost or 0 
            for stop in instance.stop.trip.stops.all() 
            for activity in stop.activities.all()
            if activity.cost
        )
        budget.activity_cost = total_activity_cost
        budget.save()

@receiver(post_delete, sender=Activity)
def update_trip_budget_on_activity_delete(sender, instance, **kwargs):
    """Update trip budget when activity is deleted"""
    if instance.cost and instance.stop.trip.auto_calculate_budget:
        budget = instance.stop.trip.budget
        # Recalculate activity costs for the trip
        total_activity_cost = sum(
            activity.cost or 0 
            for stop in instance.stop.trip.stops.all() 
            for activity in stop.activities.all()
            if activity.cost and activity.id != instance.id
        )
        budget.activity_cost = total_activity_cost
        budget.save()

@receiver(post_save, sender=Stop)
def update_trip_budget_on_stop_save(sender, instance, **kwargs):
    """Update trip budget when accommodation cost changes"""
    if instance.accommodation_cost and instance.trip.auto_calculate_budget:
        budget = instance.trip.budget
        # Recalculate accommodation costs for the trip
        total_stay_cost = sum(
            stop.accommodation_cost or 0 
            for stop in instance.trip.stops.all()
            if stop.accommodation_cost
        )
        budget.stay_cost = total_stay_cost
        budget.save()

@receiver(post_delete, sender=Stop)
def update_trip_budget_on_stop_delete(sender, instance, **kwargs):
    """Update trip budget when stop is deleted"""
    if instance.accommodation_cost and instance.trip.auto_calculate_budget:
        budget = instance.trip.budget
        # Recalculate accommodation costs for the trip
        total_stay_cost = sum(
            stop.accommodation_cost or 0 
            for stop in instance.trip.stops.all()
            if stop.accommodation_cost and stop.id != instance.id
        )
        budget.stay_cost = total_stay_cost
        budget.save()
