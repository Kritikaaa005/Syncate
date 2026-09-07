"""
Views for existing Syncate user accounts.

This module contains:

- Reading the signed-in user's profile summary
- Adding an optional recovery email after registration
- Updating a user's nickname
- Updating a user's tracking preference
- Confirming an email-verification link
- Logging in with a verified email and password

Account creation itself belongs to the registration app.
"""

import logging

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.shortcuts import render
from django.views import View

from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import (
    RefreshToken,
)
from rest_framework.throttling import ScopedRateThrottle
from .models import UserProfile
from .serializers import (
    AddEmailSerializer,
    NicknameSerializer,
    SetPasswordSerializer,
    TrackingModeSerializer,
    UserProfileReadSerializer,
    PartnerCodeSerializer,
PartnerRegistrationSerializer,
)
from .services import (
    consume_email_verification_token,
    issue_email_verification_token,
    send_verification_email,
    InvalidPartnerCodeError,
PartnerAlreadyLinkedError,
get_valid_partner_relationship,
issue_partner_code,
link_new_partner,
)


logger = logging.getLogger(__name__)


class MyProfileView(APIView):
    """
    GET /api/users/me/profile/

    Small read-only profile payload for the mobile Profile screen. Keeping
    this endpoint focused means the client does not need to infer nickname
    from cycle endpoints or keep registration response data around forever.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
        )

        serializer = UserProfileReadSerializer(profile)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class AddEmailView(APIView):
    """
    PATCH /api/users/me/email/

    Adds the optional account email after registration and sends the same
    verification link used by registration. Re-submitting the same
    unverified email intentionally acts as a resend; a verified email is not
    changeable here because changing an established recovery identity needs a
    dedicated security flow later.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "profile-email"

    def patch(self, request):
        serializer = AddEmailSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
        )
        current_email = (user.email or "").strip().lower()

        if current_email != email:
            try:
                with transaction.atomic():
                    user.email = email
                    user.save(update_fields=["email"])

                    profile.is_email_verified = False
                    profile.save(
                        update_fields=[
                            "is_email_verified",
                            "updated_at",
                        ]
                    )

                    token = issue_email_verification_token(
                        user,
                        email,
                    )
            except IntegrityError:
                return Response(
                    {
                        "email": [
                            "An account with this email already exists."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            token = issue_email_verification_token(
                user,
                email,
            )

        # Same existing design as registration: the account/email update is
        # authoritative even if the configured mail provider has a temporary
        # failure. The client receives an explicit flag instead of pretending
        # a verification email definitely went out.
        verification_sent = True
        try:
            send_verification_email(token)
        except Exception:
            verification_sent = False
            logger.exception(
                "Failed to send profile email verification for user_id=%s",
                user.id,
            )

        return Response(
            {
                "email": user.email,
                "is_email_verified": profile.is_email_verified,
                "email_verification_sent": verification_sent,
                "message": (
                    "Verification email sent."
                    if verification_sent
                    else (
                        "Email saved, but the verification email could not be sent right now."
                    )
                ),
            },
            status=status.HTTP_200_OK,
        )


class SetPasswordView(APIView):
    """
    PATCH /api/users/me/password/

    Adds a password to a passwordless account, or changes an existing
    one — same endpoint, same request shape either way:
    { "current_password"?: "...", "new_password": "...", "confirm_password": "..." }

    Whether current_password is actually required is decided entirely
    by SetPasswordSerializer from the account's real password state
    (see its docstring) — never by whatever the client happens to send.

    NOTE for whoever picks up the security audit (roadmap item #3):
    this intentionally does NOT blacklist the user's other outstanding
    refresh tokens after a change. That's a real "sign out everywhere"
    security property worth having, just not implemented yet — doing
    it half-right here (e.g. guessing which token is "this device's")
    would be worse than flagging it and doing it properly once the
    login/session-recovery flow (roadmap item #25) exists to handle a
    device gracefully discovering it's been signed out.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password-change"

    def patch(self, request):
        had_password_before = request.user.has_usable_password()

        serializer = SetPasswordSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(
            serializer.validated_data["new_password"]
        )
        request.user.save(update_fields=["password"])

        return Response(
            {
                "message": (
                    "Password added to your account."
                    if not had_password_before
                    else "Password changed successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


class UpdateNicknameView(APIView):
    """
    PATCH /api/users/me/nickname/
    """

    permission_classes = [IsAuthenticated]

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

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

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



class PartnerCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            relationship = issue_partner_code(request.user)
        except PartnerAlreadyLinkedError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                "code": relationship.code,
                "expires_at": relationship.expiration_date,
                "counter": relationship.counter,
            },
            status=status.HTTP_200_OK,
        )


class ValidatePartnerCodeView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "partner-code-validation"

    def post(self, request):
        serializer = PartnerCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        relationship = get_valid_partner_relationship(
            serializer.validated_data["code"]
        )

        if relationship is None:
            return Response(
                {"detail": "Invalid or expired partner code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"valid": True},
            status=status.HTTP_200_OK,
        )


class RegisterPartnerView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "partner-registration"

    def post(self, request):
        serializer = PartnerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        registration_data = {
            "date_of_birth": data["date_of_birth"],
            "email": data["email"],
            "password": data["password"],
        }

        try:
            relationship = link_new_partner(
                data["code"],
                registration_data,
                data["nickname"],
            )
        except InvalidPartnerCodeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        partner = relationship.partner
        refresh = RefreshToken.for_user(partner)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": partner.id,
                    "email": partner.email,
                    "nickname": partner.profile.nickname,
                    "is_email_verified": partner.profile.is_email_verified,
                    "email_verification_sent": bool(partner.email),
                },
            },
            status=status.HTTP_201_CREATED,
        )