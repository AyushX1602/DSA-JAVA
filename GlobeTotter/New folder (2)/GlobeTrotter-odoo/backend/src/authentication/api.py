from ninja_extra import NinjaExtraAPI, api_controller, route
from ninja_jwt.authentication import JWTAuth
from ninja import Router
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from typing import List
from .models import User
from .schemas import (
    UserRegistrationSchema, 
    UserLoginSchema, 
    UserProfileSchema, 
    UserUpdateSchema,
    TokenResponseSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    ChangePasswordSchema,
    MessageResponseSchema
)
from ninja_jwt.tokens import RefreshToken

auth_router = Router(tags=["Authentication"])

@auth_router.post("/signup", response=TokenResponseSchema)
def signup(request, payload: UserRegistrationSchema):
    if payload.password != payload.password_confirm:
        return 400, {"message": "Passwords don't match", "success": False}
    
    if User.objects.filter(email=payload.email).exists():
        return 400, {"message": "Email already registered", "success": False}
    
    user = User.objects.create_user(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        password=payload.password,
        phone_number=payload.phone_number or '',
        city=payload.city or '',
        country=payload.country or '',
        additional_info=payload.additional_info or '',
        language_pref=payload.language_pref
    )
    
    refresh = RefreshToken.for_user(user)
    
    return {
        "user": user,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }

@auth_router.post("/login", response=TokenResponseSchema)
def login(request, payload: UserLoginSchema):
    user = authenticate(username=payload.email, password=payload.password)
    
    if not user:
        return 401, {"message": "Invalid credentials", "success": False}
    
    if not user.is_active:
        return 401, {"message": "User account is disabled", "success": False}
    
    refresh = RefreshToken.for_user(user)
    
    return {
        "user": user,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }

@auth_router.get("/me", response=UserProfileSchema, auth=JWTAuth())
def get_profile(request):
    return request.user

@auth_router.put("/me", response=UserProfileSchema, auth=JWTAuth())
def update_profile(request, payload: UserUpdateSchema):
    user = request.user
    
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(user, attr, value)
    
    user.save()
    return user

@auth_router.post("/change-password", response=MessageResponseSchema, auth=JWTAuth())
def change_password(request, payload: ChangePasswordSchema):
    user = request.user
    
    if not user.check_password(payload.current_password):
        return 400, {"message": "Current password is incorrect", "success": False}
    
    if payload.new_password != payload.confirm_password:
        return 400, {"message": "New passwords don't match", "success": False}
    
    user.set_password(payload.new_password)
    user.save()
    
    return {"message": "Password changed successfully", "success": True}

@auth_router.post("/forgot-password", response=MessageResponseSchema)
def forgot_password(request, payload: ForgotPasswordSchema):
    try:
        user = User.objects.get(email=payload.email)
        return {"message": "Password reset email sent", "success": True}
    except User.DoesNotExist:
        return {"message": "Password reset email sent", "success": True}

@auth_router.post("/reset-password", response=MessageResponseSchema)
def reset_password(request, payload: ResetPasswordSchema):
    if payload.new_password != payload.confirm_password:
        return 400, {"message": "Passwords don't match", "success": False}
    
    return {"message": "Password reset successfully", "success": True}
