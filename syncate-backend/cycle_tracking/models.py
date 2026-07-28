from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class CycleProfile(models.Model):
    class LastPeriodStatus(models.TextChoices):
        NOT_PROVIDED = (
            "not_provided",
            "Not provided",
        )
        KNOWN = (
            "known",
            "Known",
        )
        UNKNOWN = (
            "unknown",
            "Unknown",
        )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cycle_profile",
    )

    last_period_start_date = models.DateField(
        null=True,
        blank=True,
    )

    last_period_status = models.CharField(
        max_length=20,
        choices=LastPeriodStatus.choices,
        default=LastPeriodStatus.NOT_PROVIDED,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Cycle Profile"
        verbose_name_plural = "Cycle Profiles"

    def __str__(self):
        return (
            f"Cycle profile for "
            f"{self.user.email or self.user.username}"
        )

    def clean(self):
        super().clean()

        if (
            self.last_period_start_date
            and self.last_period_start_date
            > timezone.localdate()
        ):
            raise ValidationError(
                {
                    "last_period_start_date": (
                        "The last period date cannot "
                        "be in the future."
                    ),
                }
            )

        if (
            self.last_period_status
            == self.LastPeriodStatus.KNOWN
            and not self.last_period_start_date
        ):
            raise ValidationError(
                {
                    "last_period_start_date": (
                        "A date is required when the "
                        "last period is marked as known."
                    ),
                }
            )

        if (
            self.last_period_status
            != self.LastPeriodStatus.KNOWN
            and self.last_period_start_date
            is not None
        ):
            raise ValidationError(
                {
                    "last_period_start_date": (
                        "The date must be empty when "
                        "the last period is unknown."
                    ),
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(
            *args,
            **kwargs,
        )