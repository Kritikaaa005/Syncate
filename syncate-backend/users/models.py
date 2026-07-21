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

    age = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    is_email_verified = models.BooleanField(
        default=False,
    )

    onboarding_completed = models.BooleanField(
        default=False,
    )

    is_deleted = models.BooleanField(
        default=False,
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