"""
Views for existing Syncate user accounts.

This module contains:

- Updating a user's nickname
- Updating a user's tracking preference
- Confirming an email-verification link
- Logging in with a verified email and password

Account creation itself belongs to the registration app.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View

from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import (
    RefreshToken,
)

from .models import UserProfile
from .serializers import (
    NicknameSerializer,
    TrackingModeSerializer,
)
from .services import (
    consume_email_verification_token,
)


class UpdateNicknameView(APIView):
    """
    PATCH /api/users/me/nickname/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def patch(self, request):
        profile, _ = (
            UserProfile.objects.get_or_create(
                user=request.user,
            )
        )

        serializer = NicknameSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save()

        return Response(
            {
                "profile_id": (
                    serializer.instance.profile_id
                ),
                "nickname": (
                    serializer.instance.nickname
                ),
                "message": (
                    f"Welcome, "
                    f"{serializer.instance.nickname}!"
                ),
            },
            status=status.HTTP_200_OK,
        )


class UpdateTrackingModeView(APIView):
    """
    PATCH /api/users/me/tracking-mode/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def patch(self, request):
        profile, _ = (
            UserProfile.objects.get_or_create(
                user=request.user,
            )
        )

        serializer = TrackingModeSerializer(
            profile,
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save()

        return Response(
            {
                "profile_id": (
                    serializer.instance.profile_id
                ),
                "nickname": (
                    serializer.instance.nickname
                ),
                "tracking_mode": (
                    serializer.instance.tracking_mode
                ),
                "tracking_mode_label": (
                    serializer.instance
                    .get_tracking_mode_display()
                ),
                "message": (
                    "Tracking preference saved "
                    "successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


class VerifyEmailConfirmView(View):
    """
    Browser page opened from an email-verification link.

    GET /verify-email/<token>/
    """

    def get(self, request, token):
        result = (
            consume_email_verification_token(
                token
            )
        )

        return render(
            request,
            "users/verification_result.html",
            {
                "success": result is not None,
            },
        )


class LoginView(APIView):
    """
    Login using a verified email address and password.

    POST /api/auth/login/

    Request:
    {
        "email": "user@example.com",
        "password": "password"
    }
    """

    permission_classes = [
        AllowAny,
    ]

    def post(self, request):
        email = (
            request.data.get("email")
            or ""
        ).strip().lower()

        password = (
            request.data.get("password")
            or ""
        )

        if not email or not password:
            return Response(
                {
                    "detail": (
                        "Both email and password "
                        "are required."
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        try:
            user_record = User.objects.get(
                email__iexact=email,
                is_active=True,
            )

            username = user_record.username
        except User.DoesNotExist:
            username = None
        except User.MultipleObjectsReturned:
            username = None

        user = None

        if username:
            user = authenticate(
                request=request,
                username=username,
                password=password,
            )

        if user is None:
            return Response(
                {
                    "detail": (
                        "Incorrect email or "
                        "password."
                    ),
                },
                status=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        profile, _ = (
            UserProfile.objects.get_or_create(
                user=user,
            )
        )

        if profile.is_deleted:
            return Response(
                {
                    "detail": (
                        "This account is no longer "
                        "active."
                    ),
                },
                status=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        if not profile.is_email_verified:
            return Response(
                {
                    "detail": (
                        "Please verify your email "
                        "before logging in."
                    ),
                },
                status=(
                    status.HTTP_403_FORBIDDEN
                ),
            )

        refresh = RefreshToken.for_user(
            user
        )

        return Response(
            {
                "access": str(
                    refresh.access_token
                ),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "nickname": (
                        profile.nickname
                    ),
                    "tracking_mode": (
                        profile.tracking_mode
                    ),
                    "is_email_verified": (
                        profile.is_email_verified
                    ),
                    "onboarding_completed": (
                        profile
                        .onboarding_completed
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )