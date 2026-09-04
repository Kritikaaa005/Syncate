from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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

    # === NEW: lets the mobile Settings screen decide, without a second
    # request, whether "Change password" should ask for the current
    # password first. Sourced from Django's own has_usable_password()
    # (see registration/serializers.py's module docstring for why a
    # missing password is represented as set_unusable_password() rather
    # than some sentinel value) — one source of truth, not a second
    # boolean that could drift out of sync with the real password state.
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            "nickname",
            "email",
            "is_email_verified",
            "has_password",
        )
        read_only_fields = fields

    def get_has_password(self, profile):
        return profile.user.has_usable_password()


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


class SetPasswordSerializer(serializers.Serializer):
    """
    Adds a password to an account that doesn't have one yet, or changes
    an existing one. Same endpoint for both — which fields are required
    depends entirely on `user.has_usable_password()` at request time,
    checked server-side (see registration/serializers.py's module
    docstring for why "no password" is represented via
    set_unusable_password() rather than a stored empty string).

    Deliberately NOT trusting the client to say which mode it's in: a
    request claiming "I have no current password" for an account that
    actually has one would let someone with just a stolen access token
    (no password knowledge required) silently take over the password
    slot. The server decides the mode from its own record, always.
    """

    current_password = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        write_only=True,
        trim_whitespace=False,
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        trim_whitespace=False,
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        trim_whitespace=False,
    )

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        user = self.context["request"].user

        if user.has_usable_password():
            if not attrs.get("current_password"):
                raise serializers.ValidationError(
                    {"current_password": "Enter your current password."}
                )

            if not user.check_password(attrs["current_password"]):
                raise serializers.ValidationError(
                    {"current_password": "That password is incorrect."}
                )

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords don't match."}
            )

        # A changed password should never be identical to the one it's
        # replacing — same UX rule most account-security flows enforce,
        # and it stops "current == new" being used to silently no-op
        # the change while still looking successful to the client.
        if (
            user.has_usable_password()
            and user.check_password(attrs["new_password"])
        ):
            raise serializers.ValidationError(
                {"new_password": "New password must be different from your current password."}
            )

        return attrs