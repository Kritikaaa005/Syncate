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