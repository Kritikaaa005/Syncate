"""
users/services.py

The actual logic behind three things that touch a User/UserProfile but
don't belong crammed into a view or a serializer:

1. issue_email_verification_token() / send this via email — used both at
   registration time (if an email was given) and later from Settings (if
   someone adds/changes their email after the fact, or re-sends because
   the first one expired).
2. consume_email_verification_token() — what actually runs when someone
   clicks the link.
3. deactivate_account() — the soft-delete flow: never a hard delete (see
   UserProfile.is_deleted docstring), and critically also blacklists
   every refresh token the user currently holds, so a soft-deleted
   account can't keep making authenticated requests on a token that
   hasn't naturally expired yet.

Kept as plain functions in their own file (not stuffed into models.py or
views.py) so both the registration app AND a future Settings view can
call the exact same logic without duplicating it.
"""
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailVerificationToken

TOKEN_LIFETIME = timedelta(hours=24)


def issue_email_verification_token(user: User, email: str) -> EmailVerificationToken:
    """
    Creates a fresh token for `email` and invalidates any previous unused
    tokens for this user — so if someone requests a new link (e.g. their
    first one expired, or they fixed a typo'd email), the OLD link stops
    working instead of both being valid at once.

    Returns the token row; call send_verification_email() separately to
    actually email it (kept separate so tests can create a token without
    needing to also send/mock an email).
    """
    # Invalidate anything previously issued for this user — mark as used
    # so is_valid becomes False, without touching the emails-sent history.
    EmailVerificationToken.objects.filter(user=user, used_at__isnull=True).update(
        used_at=timezone.now()
    )

    return EmailVerificationToken.objects.create(
        # secrets.token_urlsafe (not random.random / uuid4) — this is a
        # cryptographically secure random value, which matters because
        # this token is the ONLY thing standing between "anyone with the
        # link" and "this email is now verified on this account." 32
        # bytes -> 43 URL-safe characters, effectively unguessable.
        token=secrets.token_urlsafe(32),
        user=user,
        email=email,
        expires_at=timezone.now() + TOKEN_LIFETIME,
    )


def send_verification_email(token: EmailVerificationToken) -> None:
    """
    Sends the actual email. The link points at a backend-hosted
    confirmation PAGE (not an API endpoint the app deep-links into) — the
    person just taps it, sees "Verified!", and goes back to the app
    manually. Simpler than wiring up Expo universal links / app deep
    linking, and this only needs to work once per email change, not be a
    slick in-app experience.

    The token is NEVER written into the email as plain inline text next
    to instructions to "copy this code" — it's only ever the target of an
    actual link, so it can't be shoulder-surfed or misread character by
    character the way a manually-typed code could.
    """
    verify_url = f"{settings.BACKEND_PUBLIC_URL}/verify-email/{token.token}/"

    send_mail(
        subject="Confirm your email for Syncate",
        message=(
            "Tap the link below to confirm your email address:\n\n"
            f"{verify_url}\n\n"
            "This link expires in 24 hours. If you didn't request this, "
            "you can safely ignore this email."
        ),
        html_message=render_to_string(
            "users/verification_email.html", {"verify_url": verify_url}
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[token.email],
        fail_silently=False,
    )


def consume_email_verification_token(raw_token: str) -> EmailVerificationToken | None:
    """
    Looks up the token, and if it's valid (unused + unexpired), marks it
    used and flips the owning profile's is_email_verified to True.

    Returns the token row on success, or None if the token doesn't exist,
    was already used, or has expired — callers use this to decide which
    confirmation page to render (see users/views.py).
    """
    try:
        token = EmailVerificationToken.objects.select_related("user__profile").get(
            token=raw_token
        )
    except EmailVerificationToken.DoesNotExist:
        return None

    if not token.is_valid:
        return None

    token.used_at = timezone.now()
    token.save(update_fields=["used_at"])

    profile = token.user.profile
    profile.is_email_verified = True
    profile.save(update_fields=["is_email_verified", "updated_at"])

    return token


def deactivate_account(user: User) -> None:
    """
    The soft-delete flow for a registered (mobile-app) user — NOT to be
    confused with accounts/signals.py, which protects admin-panel
    superuser accounts. This is a completely separate user population
    (mobile end-users vs Django admin staff).

    Three things happen, all necessary, none optional:
    1. UserProfile.is_deleted = True — the actual soft-delete flag. Row
       stays in the database (never a hard delete — same reasoning as
       LegalDocument).
    2. user.is_active = False — Django's own auth machinery already
       checks this; an inactive user can never authenticate again through
       any normal path, belt-and-braces alongside #3.
    3. Blacklist every outstanding refresh token for this user — without
       this, a soft-deleted account could keep making authenticated API
       calls on an access token it already holds (up to 15 minutes) and,
       worse, keep refreshing that access token indefinitely using a
       refresh token that was issued before deletion and hasn't
       naturally expired (up to 30 days) — soft-deleting the row
       wouldn't actually stop API access at all without this step.
    """
    from rest_framework_simplejwt.token_blacklist.models import (
        BlacklistedToken,
        OutstandingToken,
    )

    user.profile.is_deleted = True
    user.profile.save(update_fields=["is_deleted", "updated_at"])

    user.is_active = False
    user.save(update_fields=["is_active"])

    outstanding = OutstandingToken.objects.filter(user=user)
    for token in outstanding:
        BlacklistedToken.objects.get_or_create(token=token)
