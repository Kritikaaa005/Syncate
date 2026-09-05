"""
users/models.py

UserProfile stores account information that is not already available on
Django's built-in User model.

The user's age is calculated dynamically from date_of_birth so it never
becomes stale. The profile also stores the user's Syncate tracking mode
and onboarding progress.
"""

from datetime import date

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    class TrackingMode(models.TextChoices):
        PERIOD = "period", "Period Tracking"
        PREGNANCY = "pregnancy", "Pregnancy Tracking"

    profile_id = models.BigAutoField(
        primary_key=True,
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    nickname = models.CharField(
        max_length=30,
        blank=True,
    )

    tracking_mode = models.CharField(
        max_length=20,
        choices=TrackingMode.choices,
        blank=True,
        default="",
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
        help_text=(
            "Collected during registration for the age check. "
            "Stored as a date so the calculated age never becomes stale."
        ),
    )

    is_email_verified = models.BooleanField(
        default=False,
    )

    onboarding_completed = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Whether this profile can authenticate and use registered features.",
    )

    registered_date = models.DateTimeField(
        default=timezone.now,
        editable=False,
        help_text="Date and time this user profile was registered.",
    )

    deletion_requested_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    deletion_due_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    is_deleted = models.BooleanField(
        default=False,
        help_text=(
            "Soft-delete flag. Deleted accounts remain in the database "
            "but are deactivated and prevented from authenticating."
        ),
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
        return (
            self.nickname
            or self.user.email
            or self.user.username
        )

    @property
    def age(self):
        """
        Calculate the user's current age from date_of_birth.

        Returns None when date_of_birth has not been provided.
        """
        if not self.date_of_birth:
            return None

        today = date.today()

        had_birthday_this_year = (
            today.month,
            today.day,
        ) >= (
            self.date_of_birth.month,
            self.date_of_birth.day,
        )

        return (
            today.year
            - self.date_of_birth.year
            - (0 if had_birthday_this_year else 1)
        )


class EmailVerificationToken(models.Model):
    """
    Single-use, expiring token used by email-verification links.
    """

    token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )

    email = models.EmailField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    expires_at = models.DateTimeField()

    used_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"

    def __str__(self):
        if self.used_at:
            status = "used"
        elif self.is_expired:
            status = "expired"
        else:
            status = "active"

        return (
            f"Verification token for "
            f"{self.email} ({status})"
        )

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return (
            self.used_at is None
            and not self.is_expired
        )
