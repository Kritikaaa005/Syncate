from rest_framework import serializers
from registration.serializers import RegistrationSerializer

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


class PartnerCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=8, trim_whitespace=True)

    def validate_code(self, value):
        code = value.upper()
        if not code:
            raise serializers.ValidationError("A partner code is required.")
        return code


class PartnerRegistrationSerializer(RegistrationSerializer):
    code = serializers.CharField(max_length=8, trim_whitespace=True)
    nickname = serializers.CharField(max_length=30, trim_whitespace=False)

    def validate_code(self, value):
        return value.strip().upper()

    def validate_nickname(self, value):
        return NicknameSerializer().validate_nickname(value)
