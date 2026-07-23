"""
users/models.py

UserProfile holds everything about an account that isn't already on
Django's built-in auth.User (username, password, email, is_active...).
We reuse auth.User rather than a custom user model — see module docstring
in registration/serializers.py for why that's fine here (email/password
are both optional, so a fully custom user model isn't needed to support
that).

FIX (this pass): `age` used to be a stored integer, set once at signup.
That goes stale the moment a year passes — someone who registered at 17
would show as 17 forever. Replaced with `date_of_birth`, with `age`
computed on the fly via a property instead. This is also what COPPA
verification and the registration form actually need to collect anyway
(the age-gate check needs a real birthdate, not a self-reported number).
"""
from datetime import date

from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    profile_id = models.BigAutoField(primary_key=True)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    nickname = models.CharField(
        max_length=30,
        blank=True,
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text="Collected at registration for the COPPA age check (13+). "
        "Stored as a real date rather than a precomputed age so it "
        "never goes stale.",
    )

    is_email_verified = models.BooleanField(
        default=False,
    )

    onboarding_completed = models.BooleanField(
        default=False,
    )

    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft-delete flag. Deleting an account NEVER hard-deletes "
        "the row (same reasoning as LegalDocument — see legal_docs/models.py) "
        "— it flips this flag, deactivates the Django user "
        "(is_active=False, so they can't authenticate), and blacklists "
        "every outstanding refresh token (see registration/services.py "
        "deactivate_account()).",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return self.nickname or self.user.email or self.user.username

    @property
    def age(self):
        """Computed on demand from date_of_birth — never stored, never
        stale. Returns None if date_of_birth hasn't been set yet."""
        if not self.date_of_birth:
            return None
        today = date.today()
        had_birthday_this_year = (today.month, today.day) >= (
            self.date_of_birth.month,
            self.date_of_birth.day,
        )
        return today.year - self.date_of_birth.year - (0 if had_birthday_this_year else 1)


class EmailVerificationToken(models.Model):
    """
    A single-use, expiring token behind the link in a verification email.

    Why a DB-backed token instead of just a signed/JWT-style token that
    verifies itself with no DB lookup: we need to be able to (a) mark it
    used so the SAME link can't be clicked twice, and (b) invalidate all
    of a user's outstanding tokens the moment they request a fresh one
    (e.g. they mistyped their email, fixed it, and asked for a new link —
    the old link needs to stop working, not just the new one start
    working). A signed-only token can't be revoked before its natural
    expiry; a DB row can.

    The token VALUE itself (what actually goes in the emailed link) is a
    long, random, URL-safe string generated with `secrets.token_urlsafe()`
    — never anything derived from the user's id/email/etc, and never
    logged anywhere. See registration/services.py for generation.
    """

    token = models.CharField(max_length=64, unique=True, db_index=True)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )

    # Snapshot of which email address this token verifies. Deliberately
    # NOT just "verify whatever user.email currently is" — if the user
    # requests a link, then changes their email before clicking it, the
    # old link should verify the OLD address (or better, just fail
    # cleanly) rather than silently verifying whatever email happens to
    # be on the account by the time they click it.
    email = models.EmailField()

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"

    def __str__(self):
        status = "used" if self.used_at else ("expired" if self.is_expired else "active")
        return f"Verification token for {self.email} ({status})"

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return self.used_at is None and not self.is_expired
