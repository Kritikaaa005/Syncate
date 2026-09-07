"""
Views for existing Syncate user accounts.

This module contains:

- Reading the signed-in user's profile summary
- Adding an optional recovery email after registration
- Adding or changing an account password
- Updating a user's nickname
- Reading and updating a user's tracking preference
- Confirming an email-verification link
- Logging in with a verified email and password
- Partner Sync code generation, validation, and registration
- Account deactivation, scheduled deletion, restoration, and permanent deletion

Account creation itself belongs to the registration app.
"""

import logging

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.shortcuts import render
from django.utils import timezone
from django.views import View

from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import (
    AddEmailSerializer,
    NicknameSerializer,
    PartnerCodeSerializer,
    PartnerRegistrationSerializer,
    SetPasswordSerializer,
    TrackingModeSerializer,
    UserProfileReadSerializer,
)
from .services import (
    InvalidPartnerCodeError,
    PartnerAlreadyLinkedError,
    consume_email_verification_token,
    deactivate_account,
    get_valid_partner_relationship,
    issue_email_verification_token,
    issue_partner_code,
    link_new_partner,
    permanently_delete_user,
    restore_scheduled_account,
    schedule_account_deletion,
    send_verification_email,
)


logger = logging.getLogger(__name__)


class MyProfileView(APIView):
    """
    GET /api/users/me/profile/

    Return the signed-in user's profile information.
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

    Add an optional recovery email after registration or resend
    verification for the same unverified email.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "profile-email"

    def patch(self, request):
        serializer = AddEmailSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]
        user = request.user

        profile, _ = UserProfile.objects.get_or_create(
            user=user,
        )

        current_email = (
            user.email or ""
        ).strip().lower()

        if current_email != email:
            try:
                with transaction.atomic():
                    user.email = email
                    user.save(
                        update_fields=["email"]
                    )

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
                            (
                                "An account with this "
                                "email already exists."
                            )
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:
            token = issue_email_verification_token(
                user,
                email,
            )

        verification_sent = True

        try:
            send_verification_email(token)

        except Exception:
            verification_sent = False

            logger.exception(
                (
                    "Failed to send profile email "
                    "verification for user_id=%s"
                ),
                user.id,
            )

        return Response(
            {
                "email": user.email,
                "is_email_verified": (
                    profile.is_email_verified
                ),
                "email_verification_sent": (
                    verification_sent
                ),
                "message": (
                    "Verification email sent."
                    if verification_sent
                    else (
                        "Email saved, but the "
                        "verification email could not "
                        "be sent right now."
                    )
                ),
            },
            status=status.HTTP_200_OK,
        )


class SetPasswordView(APIView):
    """
    PATCH /api/users/me/password/

    Add a password to a passwordless account or change an existing
    password.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password-change"

    def patch(self, request):
        had_password_before = (
            request.user.has_usable_password()
        )

        serializer = SetPasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True
        )

        request.user.set_password(
            serializer.validated_data[
                "new_password"
            ]
        )

        request.user.save(
            update_fields=["password"]
        )

        return Response(
            {
                "message": (
                    "Password added to your account."
                    if not had_password_before
                    else (
                        "Password changed "
                        "successfully."
                    )
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
    GET or PATCH /api/users/me/tracking-mode/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = (
            UserProfile.objects.get_or_create(
                user=request.user,
            )
        )

        return Response(
            {
                "profile_id": profile.profile_id,
                "nickname": profile.nickname,
                "tracking_mode": (
                    profile.tracking_mode
                ),
                "tracking_mode_label": (
                    profile.get_tracking_mode_display()
                    if profile.tracking_mode
                    else ""
                ),
            },
            status=status.HTTP_200_OK,
        )

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


class DeactivateAccountView(APIView):
    """
    DELETE /api/users/me/account/

    Immediately deactivate an account without scheduling permanent
    deletion.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        deactivate_account(
            request.user
        )

        return Response(
            {
                "detail": (
                    "Account deactivated "
                    "successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )


class ScheduleAccountDeletionView(APIView):
    """
    POST /api/users/me/account/schedule-deletion/

    Disable the account immediately and schedule permanent deletion
    after the grace period.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        due_at = schedule_account_deletion(
            request.user
        )

        return Response(
            {
                "detail": (
                    "Account scheduled for deletion."
                ),
                "deletion_due_at": due_at,
            },
            status=status.HTTP_200_OK,
        )


class PermanentDeleteAccountView(APIView):
    """
    DELETE /api/users/me/account/permanent/

    Permanently delete the signed-in account immediately.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        permanently_delete_user(
            request.user
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class RestoreScheduledAccountView(APIView):
    """
    POST /api/auth/restore-account/

    Restore an account that is still within its deletion grace period.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (
            request.data.get("email") or ""
        ).strip().lower()

        password = (
            request.data.get("password") or ""
        )

        try:
            user = (
                User.objects
                .select_related("profile")
                .get(email__iexact=email)
            )

        except (
            User.DoesNotExist,
            User.MultipleObjectsReturned,
        ):
            user = None

        if (
            not user
            or not user.check_password(password)
        ):
            return Response(
                {
                    "detail": (
                        "Incorrect email or password."
                    ),
                },
                status=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        try:
            user = restore_scheduled_account(
                user
            )

        except ValueError:
            return Response(
                {
                    "detail": (
                        "This account can no longer "
                        "be restored."
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
                "detail": (
                    "Account restored successfully."
                ),
                "access": str(
                    refresh.access_token
                ),
                "refresh": str(refresh),
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
                "success": (
                    result is not None
                ),
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

    Accounts that are scheduled for deletion receive a special response
    so the mobile application can offer account restoration.
    """

    permission_classes = [AllowAny]

    throttle_classes = [
        ScopedRateThrottle
    ]
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

        # Do NOT filter by is_active here.
        #
        # Scheduled-for-deletion accounts are deliberately inactive,
        # but we still need to find them so the client can offer the
        # restore-account flow.
        try:
            user_record = User.objects.get(
                email__iexact=email,
            )

        except User.DoesNotExist:
            user_record = None

        except User.MultipleObjectsReturned:
            user_record = None

        if (
            not user_record
            or not user_record.check_password(
                password
            )
        ):
            return Response(
                {
                    "detail": (
                        "Incorrect email or password."
                    ),
                },
                status=(
                    status.HTTP_401_UNAUTHORIZED
                ),
            )

        profile, _ = (
            UserProfile.objects.get_or_create(
                user=user_record,
            )
        )

        # An account inside the deletion grace period needs to be
        # distinguished from an ordinary invalid/inactive account.
        if (
            profile.deletion_due_at
            and (
                profile.deletion_due_at
                > timezone.now()
            )
        ):
            return Response(
                {
                    "code": (
                        "ACCOUNT_SCHEDULED_FOR_DELETION"
                    ),
                    "detail": (
                        "This account is scheduled "
                        "for deletion."
                    ),
                    "deletion_due_at": (
                        profile.deletion_due_at
                    ),
                },
                status=(
                    status.HTTP_403_FORBIDDEN
                ),
            )

        user = None

        if user_record.is_active:
            user = authenticate(
                request=request,
                username=(
                    user_record.username
                ),
                password=password,
            )

        if user is None:
            return Response(
                {
                    "detail": (
                        "Incorrect email or password."
                    ),
                },
                status=(
                    status.HTTP_401_UNAUTHORIZED
                ),
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
    """
    Generate a partner code for the signed-in primary user.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            relationship = issue_partner_code(
                request.user
            )

        except PartnerAlreadyLinkedError as exc:
            return Response(
                {
                    "detail": str(exc),
                },
                status=(
                    status.HTTP_409_CONFLICT
                ),
            )

        return Response(
            {
                "code": relationship.code,
                "expires_at": (
                    relationship.expiration_date
                ),
                "counter": (
                    relationship.counter
                ),
            },
            status=status.HTTP_200_OK,
        )


class ValidatePartnerCodeView(APIView):
    """
    Validate a partner code before partner registration.
    """

    permission_classes = [AllowAny]

    throttle_classes = [
        ScopedRateThrottle
    ]
    throttle_scope = (
        "partner-code-validation"
    )

    def post(self, request):
        serializer = PartnerCodeSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        relationship = (
            get_valid_partner_relationship(
                serializer.validated_data[
                    "code"
                ]
            )
        )

        if relationship is None:
            return Response(
                {
                    "detail": (
                        "Invalid or expired "
                        "partner code."
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        return Response(
            {
                "valid": True,
            },
            status=status.HTTP_200_OK,
        )


class RegisterPartnerView(APIView):
    """
    Register a new user as the partner associated with a valid
    partner code.
    """

    permission_classes = [AllowAny]

    throttle_classes = [
        ScopedRateThrottle
    ]
    throttle_scope = "partner-registration"

    def post(self, request):
        serializer = (
            PartnerRegistrationSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        registration_data = {
            "date_of_birth": (
                data["date_of_birth"]
            ),
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
                {
                    "detail": str(exc),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        partner = relationship.partner

        refresh = RefreshToken.for_user(
            partner
        )

        return Response(
            {
                "access": str(
                    refresh.access_token
                ),
                "refresh": str(refresh),
                "user": {
                    "id": partner.id,
                    "email": partner.email,
                    "nickname": (
                        partner.profile.nickname
                    ),
                    "is_email_verified": (
                        partner.profile
                        .is_email_verified
                    ),
                    "email_verification_sent": (
                        bool(partner.email)
                    ),
                },
            },
            status=status.HTTP_201_CREATED,
        )