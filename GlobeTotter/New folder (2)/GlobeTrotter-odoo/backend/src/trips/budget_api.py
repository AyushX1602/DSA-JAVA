from ninja import Router
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404
from typing import List
from .models import Trip, Budget
from .schemas import BudgetSchema, BudgetCreateSchema, BudgetUpdateSchema
from authentication.schemas import MessageResponseSchema

budget_router = Router(tags=["Budget Management"])

# Budget endpoints
@budget_router.get("/trips/{trip_id}/budget", response=BudgetSchema, auth=JWTAuth())
def get_budget(request, trip_id: str):
    """Get budget for a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    budget, created = Budget.objects.get_or_create(trip=trip, defaults={'currency': trip.currency})
    
    return {
        'id': budget.id,
        'transport_cost': budget.transport_cost,
        'stay_cost': budget.stay_cost,
        'activity_cost': budget.activity_cost,
        'meal_cost': budget.meal_cost,
        'shopping_cost': budget.shopping_cost,
        'miscellaneous_cost': budget.miscellaneous_cost,
        'transport_limit': budget.transport_limit,
        'stay_limit': budget.stay_limit,
        'activity_limit': budget.activity_limit,
        'meal_limit': budget.meal_limit,
        'shopping_limit': budget.shopping_limit,
        'miscellaneous_limit': budget.miscellaneous_limit,
        'currency': budget.currency,
        'total_cost': budget.total_cost,
        'total_limit': budget.total_limit,
        'is_over_budget': budget.is_over_budget,
        'created_at': budget.created_at,
        'updated_at': budget.updated_at
    }

@budget_router.put("/trips/{trip_id}/budget", response=BudgetSchema, auth=JWTAuth())
def update_budget(request, trip_id: str, payload: BudgetUpdateSchema):
    """Update budget for a trip"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    budget, created = Budget.objects.get_or_create(trip=trip, defaults={'currency': trip.currency})
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(budget, attr, value)
    
    budget.save()
    
    return {
        'id': budget.id,
        'transport_cost': budget.transport_cost,
        'stay_cost': budget.stay_cost,
        'activity_cost': budget.activity_cost,
        'meal_cost': budget.meal_cost,
        'shopping_cost': budget.shopping_cost,
        'miscellaneous_cost': budget.miscellaneous_cost,
        'transport_limit': budget.transport_limit,
        'stay_limit': budget.stay_limit,
        'activity_limit': budget.activity_limit,
        'meal_limit': budget.meal_limit,
        'shopping_limit': budget.shopping_limit,
        'miscellaneous_limit': budget.miscellaneous_limit,
        'currency': budget.currency,
        'total_cost': budget.total_cost,
        'total_limit': budget.total_limit,
        'is_over_budget': budget.is_over_budget,
        'created_at': budget.created_at,
        'updated_at': budget.updated_at
    }

@budget_router.get("/trips/{trip_id}/budget/summary", response=dict, auth=JWTAuth())
def get_budget_summary(request, trip_id: str):
    """Get budget summary with breakdown and alerts"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    budget, created = Budget.objects.get_or_create(trip=trip, defaults={'currency': trip.currency})
    
    # Calculate percentages
    total_cost = float(budget.total_cost)
    breakdown = {}
    
    if total_cost > 0:
        breakdown = {
            'transport': {
                'amount': float(budget.transport_cost),
                'percentage': (float(budget.transport_cost) / total_cost) * 100
            },
            'stay': {
                'amount': float(budget.stay_cost),
                'percentage': (float(budget.stay_cost) / total_cost) * 100
            },
            'activity': {
                'amount': float(budget.activity_cost),
                'percentage': (float(budget.activity_cost) / total_cost) * 100
            },
            'meal': {
                'amount': float(budget.meal_cost),
                'percentage': (float(budget.meal_cost) / total_cost) * 100
            },
            'shopping': {
                'amount': float(budget.shopping_cost),
                'percentage': (float(budget.shopping_cost) / total_cost) * 100
            },
            'miscellaneous': {
                'amount': float(budget.miscellaneous_cost),
                'percentage': (float(budget.miscellaneous_cost) / total_cost) * 100
            }
        }
    
    # Calculate alerts
    alerts = []
    if budget.total_limit and budget.is_over_budget:
        alerts.append({
            'type': 'danger',
            'message': f'Budget exceeded by {float(budget.total_cost - budget.total_limit):.2f} {budget.currency}'
        })
    
    # Check individual category limits
    categories = [
        ('transport', budget.transport_cost, budget.transport_limit),
        ('stay', budget.stay_cost, budget.stay_limit),
        ('activity', budget.activity_cost, budget.activity_limit),
        ('meal', budget.meal_cost, budget.meal_limit),
        ('shopping', budget.shopping_cost, budget.shopping_limit),
        ('miscellaneous', budget.miscellaneous_cost, budget.miscellaneous_limit),
    ]
    
    for category, cost, limit in categories:
        if limit and cost > limit:
            alerts.append({
                'type': 'warning',
                'message': f'{category.title()} budget exceeded by {float(cost - limit):.2f} {budget.currency}'
            })
        elif limit and cost > (limit * 0.8):  # 80% threshold warning
            alerts.append({
                'type': 'info',
                'message': f'{category.title()} budget at {(float(cost) / float(limit) * 100):.1f}% of limit'
            })
    
    return {
        'total_cost': total_cost,
        'total_limit': float(budget.total_limit) if budget.total_limit else None,
        'currency': budget.currency,
        'breakdown': breakdown,
        'alerts': alerts,
        'is_over_budget': budget.is_over_budget,
        'budget_utilization': (total_cost / float(budget.total_limit) * 100) if budget.total_limit else 0
    }

@budget_router.post("/trips/{trip_id}/budget/recalculate", response=BudgetSchema, auth=JWTAuth())
def recalculate_budget(request, trip_id: str):
    """Recalculate budget from actual trip data"""
    trip = get_object_or_404(Trip, id=trip_id, user=request.user)
    budget, created = Budget.objects.get_or_create(trip=trip, defaults={'currency': trip.currency})
    
    # Calculate from actual trip data
    total_activity_cost = 0
    total_stay_cost = 0
    
    for stop in trip.stops.all():
        # Add accommodation costs
        if stop.accommodation_cost:
            total_stay_cost += float(stop.accommodation_cost)
        
        # Add activity costs
        for activity in stop.activities.all():
            if activity.cost:
                total_activity_cost += float(activity.cost)
    
    # Update budget with calculated values
    budget.activity_cost = total_activity_cost
    budget.stay_cost = total_stay_cost
    budget.save()
    
    return {
        'id': budget.id,
        'transport_cost': budget.transport_cost,
        'stay_cost': budget.stay_cost,
        'activity_cost': budget.activity_cost,
        'meal_cost': budget.meal_cost,
        'shopping_cost': budget.shopping_cost,
        'miscellaneous_cost': budget.miscellaneous_cost,
        'transport_limit': budget.transport_limit,
        'stay_limit': budget.stay_limit,
        'activity_limit': budget.activity_limit,
        'meal_limit': budget.meal_limit,
        'shopping_limit': budget.shopping_limit,
        'miscellaneous_limit': budget.miscellaneous_limit,
        'currency': budget.currency,
        'total_cost': budget.total_cost,
        'total_limit': budget.total_limit,
        'is_over_budget': budget.is_over_budget,
        'created_at': budget.created_at,
        'updated_at': budget.updated_at
    }
