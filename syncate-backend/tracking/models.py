from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class DailyLog(models.Model):
    """
    One row per user per calendar date.

    Everything the user logs for that date (flow,
    symptoms, mood, discharge, sexual health,
    medication, lifestyle, fertility, notes) lives
    inside `data` as a JSON object, keyed by
    category id, e.g.:

    {
        "flow": "medium",
        "symptoms": ["cramps", "bloating"],
        "notes": "felt off today"
    }

    New categories can be added on the frontend
    without needing a migration here.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="daily_logs",
    )

    log_date = models.DateField()

    data = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-log_date"]
        verbose_name = "Daily Log"
        verbose_name_plural = "Daily Logs"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "log_date"],
                name="unique_daily_log_per_user_per_date",
            )
        ]

    def __str__(self):
        return (
            f"Log for "
            f"{self.user.email or self.user.username} "
            f"on {self.log_date.isoformat()}"
        )

    def clean(self):
        super().clean()

        if (
            self.log_date
            and self.log_date
            > timezone.localdate()
        ):
            raise ValidationError(
                {
                    "log_date": (
                        "The log date cannot "
                        "be in the future."
                    ),
                }
            )

        if not isinstance(self.data, dict):
            raise ValidationError(
                {
                    "data": (
                        "Log data must be a "
                        "JSON object."
                    ),
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(
            *args,
            **kwargs,
        )