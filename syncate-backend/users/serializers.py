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
    Validate an email being attached to the signed-in account.

    A user who already has a verified email cannot change it through this
    endpoint yet; email-change verification is a separate future Settings
    feature. Re-submitting the same *unverified* email is allowed so the
    existing verification flow can issue a fresh link if needed.
    """

    email = serializers.EmailField(
        required=True,
        allow_blank=False,
    )

    def validate_email(self, value):
        request = self.context["request"]
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
        )

        normalized = value.strip().lower()
        current_email = (user.email or "").strip().lower()

        if current_email:
            if profile.is_email_verified:
                raise serializers.ValidationError(
                    "A verified email address is already attached to this account."
                )

            if current_email != normalized:
                raise serializers.ValidationError(
                    "An unverified email is already attached. Email changes will be available later."
                )

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
