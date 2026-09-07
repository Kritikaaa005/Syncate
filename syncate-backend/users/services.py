"""
users/services.py

Shared service logic for Syncate user accounts.

This module handles:

1. Email verification:
   - issuing verification tokens
   - sending verification emails
   - consuming verification tokens

2. Partner Sync:
   - generating partner codes
   - validating partner codes
   - linking newly registered partners

3. Account lifecycle:
   - immediate soft deactivation
   - scheduled deletion with a 30-day grace period
   - restoring an account during the grace period
   - permanent deletion
   - blacklisting outstanding JWT refresh tokens

Keeping this logic here prevents views and serializers from duplicating
database and account-management behaviour.
"""

import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.template.loader import render_to_string
from django.utils import timezone

from .models import (
    EmailVerificationToken,
    UserPartner,
    UserProfile,
)


TOKEN_LIFETIME = timedelta(hours=24)

PARTNER_CODE_LIFETIME = timedelta(hours=24)
PARTNER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
PARTNER_CODE_LENGTH = 8

DELETION_GRACE_PERIOD = timedelta(days=30)


class PartnerAlreadyLinkedError(Exception):
    pass


class InvalidPartnerCodeError(Exception):
    pass


def normalize_partner_code(raw_code: str) -> str:
    return (raw_code or "").strip().upper()


def _new_partner_code() -> str:
    return "".join(
        secrets.choice(PARTNER_CODE_ALPHABET)
        for _ in range(PARTNER_CODE_LENGTH)
    )


def issue_partner_code(user: User) -> UserPartner:
    """
    Generate or regenerate a partner code for the primary user.

    A code expires after 24 hours. If the user already has a linked
    partner, another code cannot be generated.
    """

    expires_at = timezone.now() + PARTNER_CODE_LIFETIME

    with transaction.atomic():
        try:
            relationship = (
                UserPartner.objects
                .select_for_update()
                .get(user=user)
            )
        except UserPartner.DoesNotExist:
            relationship = UserPartner(user=user)

        if relationship.partner_id is not None:
            raise PartnerAlreadyLinkedError(
                "A partner is already linked to this account."
            )

        next_counter = relationship.counter + 1

        for _ in range(10):
            candidate = _new_partner_code()

            relationship.code = candidate
            relationship.expiration_date = expires_at
            relationship.counter = next_counter

            try:
                with transaction.atomic():
                    relationship.save()

                return relationship

            except IntegrityError:
                if UserPartner.objects.filter(
                    code=candidate
                ).exists():
                    continue

                raise

    raise RuntimeError(
        "Could not generate a unique partner code."
    )


def get_valid_partner_relationship(
    raw_code: str,
) -> UserPartner | None:
    """
    Return the active relationship represented by a partner code.

    Returns None when the code does not exist, has expired, or has
    already been used to link a partner.
    """

    code = normalize_partner_code(raw_code)

    if not code:
        return None

    try:
        relationship = UserPartner.objects.get(
            code=code
        )
    except UserPartner.DoesNotExist:
        return None

    if (
        relationship.partner_id is not None
        or relationship.expiration_date is None
        or relationship.expiration_date <= timezone.now()
    ):
        return None

    return relationship


def link_new_partner(
    raw_code: str,
    registration_data: dict,
    nickname: str,
) -> UserPartner:
    """
    Register a new user as a partner and attach that account to the
    primary user represented by the supplied partner code.
    """

    from registration.serializers import RegistrationSerializer

    code = normalize_partner_code(raw_code)

    with transaction.atomic():
        try:
            relationship = (
                UserPartner.objects
                .select_for_update()
                .get(code=code)
            )
        except UserPartner.DoesNotExist as exc:
            raise InvalidPartnerCodeError(
                "Invalid or expired partner code."
            ) from exc

        if (
            relationship.partner_id is not None
            or relationship.expiration_date is None
            or relationship.expiration_date <= timezone.now()
        ):
            raise InvalidPartnerCodeError(
                "Invalid or expired partner code."
            )

        partner = RegistrationSerializer().create(
            registration_data
        )

        if partner.pk == relationship.user_id:
            raise InvalidPartnerCodeError(
                "Invalid partner relationship."
            )

        if UserPartner.objects.filter(
            partner=partner
        ).exists():
            raise InvalidPartnerCodeError(
                "This account is already linked as a partner."
            )

        partner.profile.nickname = nickname
        partner.profile.save(
            update_fields=[
                "nickname",
                "updated_at",
            ]
        )

        relationship.partner = partner
        relationship.linked_at = timezone.now()
        relationship.code = None
        relationship.expiration_date = None

        relationship.save(
            update_fields=[
                "partner",
                "linked_at",
                "code",
                "expiration_date",
                "updated_at",
            ]
        )

        return relationship


def _blacklist_outstanding_tokens(
    user: User,
) -> None:
    """
    Revoke every outstanding SimpleJWT refresh token owned by the user.
    """

    from rest_framework_simplejwt.token_blacklist.models import (
        BlacklistedToken,
        OutstandingToken,
    )

    for token in OutstandingToken.objects.filter(
        user=user
    ):
        BlacklistedToken.objects.get_or_create(
            token=token
        )


def issue_email_verification_token(
    user: User,
    email: str,
) -> EmailVerificationToken:
    """
    Create a fresh email-verification token.

    Any previous unused token for the user is invalidated before the
    new token is generated.
    """

    EmailVerificationToken.objects.filter(
        user=user,
        used_at__isnull=True,
    ).update(
        used_at=timezone.now()
    )

    return EmailVerificationToken.objects.create(
        token=secrets.token_urlsafe(32),
        user=user,
        email=email,
        expires_at=timezone.now() + TOKEN_LIFETIME,
    )


def send_verification_email(
    token: EmailVerificationToken,
) -> None:
    """
    Send the email-verification link to the user.
    """

    verify_url = (
        f"{settings.BACKEND_PUBLIC_URL}"
        f"/verify-email/{token.token}/"
    )

    send_mail(
        subject="Confirm your email for Syncate",
        message=(
            "Tap the link below to confirm your email address:\n\n"
            f"{verify_url}\n\n"
            "This link expires in 24 hours. "
            "If you didn't request this, "
            "you can safely ignore this email."
        ),
        html_message=render_to_string(
            "users/verification_email.html",
            {
                "verify_url": verify_url,
            },
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[
            token.email,
        ],
        fail_silently=False,
    )


def consume_email_verification_token(
    raw_token: str,
) -> EmailVerificationToken | None:
    """
    Validate and consume an email-verification token.

    On success the owning UserProfile is marked as email verified.
    """

    try:
        token = (
            EmailVerificationToken.objects
            .select_related("user__profile")
            .get(token=raw_token)
        )
    except EmailVerificationToken.DoesNotExist:
        return None

    if not token.is_valid:
        return None

    token.used_at = timezone.now()
    token.save(
        update_fields=[
            "used_at",
        ]
    )

    profile = token.user.profile
    profile.is_email_verified = True

    profile.save(
        update_fields=[
            "is_email_verified",
            "updated_at",
        ]
    )

    return token


@transaction.atomic
def deactivate_account(
    user: User,
) -> None:
    """
    Immediately soft-deactivate a registered Syncate account.

    The account remains in the database, but both Django User and
    UserProfile are marked inactive. Existing refresh tokens are also
    revoked.
    """

    locked_user = (
        User.objects
        .select_for_update()
        .get(pk=user.pk)
    )

    profile = (
        UserProfile.objects
        .select_for_update()
        .get(user=locked_user)
    )

    profile.is_active = False
    profile.is_deleted = True

    # Immediate deactivation is different from scheduled deletion.
    profile.deletion_requested_at = None
    profile.deletion_due_at = None

    profile.save(
        update_fields=[
            "is_active",
            "is_deleted",
            "deletion_requested_at",
            "deletion_due_at",
            "updated_at",
        ]
    )

    locked_user.is_active = False
    locked_user.save(
        update_fields=[
            "is_active",
        ]
    )

    _blacklist_outstanding_tokens(
        locked_user
    )


@transaction.atomic
def schedule_account_deletion(
    user: User,
):
    """
    Disable the account immediately and schedule permanent deletion
    after the 30-day grace period.

    Returns the date/time at which deletion becomes due.
    """

    locked_user = (
        User.objects
        .select_for_update()
        .get(pk=user.pk)
    )

    profile = (
        UserProfile.objects
        .select_for_update()
        .get(user=locked_user)
    )

    requested_at = timezone.now()

    profile.is_active = False
    profile.is_deleted = True
    profile.deletion_requested_at = requested_at
    profile.deletion_due_at = (
        requested_at + DELETION_GRACE_PERIOD
    )

    profile.save(
        update_fields=[
            "is_active",
            "is_deleted",
            "deletion_requested_at",
            "deletion_due_at",
            "updated_at",
        ]
    )

    locked_user.is_active = False
    locked_user.save(
        update_fields=[
            "is_active",
        ]
    )

    _blacklist_outstanding_tokens(
        locked_user
    )

    return profile.deletion_due_at


@transaction.atomic
def restore_scheduled_account(
    user: User,
) -> User:
    """
    Restore an account while its 30-day deletion grace period is still
    active.

    Raises ValueError when the account is no longer restorable.
    """

    locked_user = (
        User.objects
        .select_for_update()
        .get(pk=user.pk)
    )

    profile = (
        UserProfile.objects
        .select_for_update()
        .get(user=locked_user)
    )

    if (
        not profile.deletion_due_at
        or timezone.now() >= profile.deletion_due_at
    ):
        raise ValueError(
            "Account is not restorable."
        )

    profile.is_active = True
    profile.is_deleted = False
    profile.deletion_requested_at = None
    profile.deletion_due_at = None

    profile.save(
        update_fields=[
            "is_active",
            "is_deleted",
            "deletion_requested_at",
            "deletion_due_at",
            "updated_at",
        ]
    )

    locked_user.is_active = True
    locked_user.save(
        update_fields=[
            "is_active",
        ]
    )

    return locked_user


@transaction.atomic
def permanently_delete_user(
    user: User,
) -> None:
    """
    Permanently delete the Django user.

    Related records using CASCADE are removed by Django's relationship
    rules. Relationships using SET_NULL are preserved where designed.
    """

    locked_user = (
        User.objects
        .select_for_update()
        .get(pk=user.pk)
    )

    locked_user.delete()