# LOCATION: syncate-backend/cycle_tracking/models.py
# (replaces the existing file)

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class CycleProfile(models.Model):
    """
    One row per user, holding their ONBOARDING ANSWERS — not their
    period history anymore (that's PeriodLog below, one row per
    actual period).

    Think of this as "what do we assume when we don't have real
    logged data yet". Every field here has a confidence tag next to
    it because "28 days" means something different depending on
    whether the user typed it in themselves or just tapped "idk".
    We need to know which, otherwise predictions quietly pretend to
    be more accurate than they are.
    """

    class EstimateConfidence(models.TextChoices):
        # user typed/picked an exact number they're sure about
        EXACT = "exact", "Exact"
        # user picked a rough bucket (e.g. "25-30 days") during onboarding
        ESTIMATED = "estimated", "Estimated"
        # user tapped "idk" — we're using the fallback default below
        UNKNOWN = "unknown", "Unknown"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cycle_profile",
    )

    # Population-average fallback (28 days) until we know better.
    # Stays at this default forever if the user keeps saying "idk" —
    # that's fine, it's a safe placeholder, not a real prediction.
    cycle_length_days = models.PositiveSmallIntegerField(
        default=28,
    )

    cycle_length_confidence = models.CharField(
        max_length=20,
        choices=EstimateConfidence.choices,
        default=EstimateConfidence.UNKNOWN,
    )

    # Same idea, just for "how many days do you bleed" (used later
    # for period-length display / calendar shading, not in the
    # cycle-day math itself).
    period_length_days = models.PositiveSmallIntegerField(
        default=5,
    )

    period_length_confidence = models.CharField(
        max_length=20,
        choices=EstimateConfidence.choices,
        default=EstimateConfidence.UNKNOWN,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Cycle Profile"
        verbose_name_plural = "Cycle Profiles"

    def __str__(self):
        return f"Cycle profile for {self.user.email or self.user.username}"

    def clean(self):
        super().clean()

        # Sanity ranges — same bounds services.py already enforces at
        # calculation time, just catching bad data earlier, at save time.
        if not (21 <= self.cycle_length_days <= 45):
            raise ValidationError(
                {"cycle_length_days": "Cycle length must be between 21 and 45 days."}
            )

        if not (1 <= self.period_length_days <= 10):
            raise ValidationError(
                {"period_length_days": "Period length must be between 1 and 10 days."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class PeriodLog(models.Model):
    """
    One row = one actual period the user logged. This is THE history
    table — the calendar, averages, irregularity detection, "what
    happened last year" all read from here. Nothing gets overwritten;
    every new period is a new row.

    We deliberately did NOT make this an array field on CycleProfile.
    Rows let Postgres index/query by date range properly (try doing
    "average of last 6 cycles" on an array column and see how that
    goes), and the unique constraint below stops the same period
    getting logged twice by mistake.
    """

    class DateConfidence(models.TextChoices):
        # exact date the user typed in
        EXACT = "exact", "Exact"
        # rough date the user picked when they weren't 100% sure
        ESTIMATED = "estimated", "Estimated"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="period_logs",
    )

    start_date = models.DateField()

    # Null while the period is still ongoing (user logs the start,
    # end gets filled in later or on the next log). Not required.
    end_date = models.DateField(
        null=True,
        blank=True,
    )

    date_confidence = models.CharField(
        max_length=20,
        choices=DateConfidence.choices,
        default=DateConfidence.EXACT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Period Log"
        verbose_name_plural = "Period Logs"
        constraints = [
            # Stops accidental double-logging of the same period.
            # DB-level, not just a form check — same philosophy as the
            # partial unique index on legal_docs, the app-level check
            # alone isn't the real safety net.
            models.UniqueConstraint(
                fields=["user", "start_date"],
                name="unique_period_start_per_user",
            ),
        ]

    def __str__(self):
        return f"Period for {self.user.email or self.user.username} starting {self.start_date}"

    def clean(self):
        super().clean()

        if self.start_date and self.start_date > timezone.localdate():
            raise ValidationError(
                {"start_date": "The period start date cannot be in the future."}
            )

        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError(
                {"end_date": "The period end date can't be before it started."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)