from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class NicknameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("nickname",)

    def validate_nickname(self, value):
        if any(character in value for character in ("\n", "\r", "\t")):
            raise serializers.ValidationError(
                "Nickname cannot contain line breaks or tabs."
            )

        nickname = value.strip()

        if not nickname:
            raise serializers.ValidationError(
                "Nickname cannot be empty."
            )

        if len(nickname) < 2:
            raise serializers.ValidationError(
                "Nickname must contain at least 2 characters."
            )

        if len(nickname) > 30:
            raise serializers.ValidationError(
                "Nickname cannot exceed 30 characters."
            )

        return nickname


class TrackingModeSerializer(serializers.ModelSerializer):
    tracking_mode = serializers.ChoiceField(
        choices=UserProfile.TrackingMode.choices,
        required=True,
        allow_blank=False,
    )

    class Meta:
        model = UserProfile
        fields = ("tracking_mode",)


class UserProfileReadSerializer(serializers.ModelSerializer):
    """Read-only shape used by the mobile Profile screen."""

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = UserProfile
        fields = (
            "nickname",
            "email",
            "is_email_verified",
        )
        read_only_fields = fields


class AddEmailSerializer(serializers.Serializer):
    """
    Validate an email being added to or changed on the signed-in account.

    A user may add or change an email, and re-submitting the same unverified
    email acts as a verification resend. The email must not belong to
    another account.
    """

    email = serializers.EmailField(
        required=True,
        allow_blank=False,
    )

    def validate_email(self, value):
        request = self.context["request"]
        user = request.user

        normalized = value.strip().lower()

        if (
            User.objects.filter(
                email__iexact=normalized,
            )
            .exclude(pk=user.pk)
            .exists()
        ):
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return normalized
