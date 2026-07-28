"""
registration/serializers.py

Why auth.User (built-in) instead of a fully custom user model: the only
things registration actually needs beyond what auth.User already gives
us for free (password hashing, is_active, is_superuser/is_staff for the
completely separate admin population) are date_of_birth and
is_email_verified — both of which already live on UserProfile
(users/models.py), created automatically via the existing
users/signals.py post_save hook the moment a User is created. So there
was nothing to gain from a custom user model here, and real cost (losing
Django's well-tested built-in auth machinery) — reusing it and layering
UserProfile on top, same as the rest of this codebase already does.

WHY NO PASSWORD IS REQUIRED AT REGISTRATION:
------------------------------------------------------------------------
Product decision (matches every mainstream period-tracking app, and
avoids friction for a first-time guest converting to a real account):
registering creates a fully working account immediately, no password
needed. What that means concretely:

- If no password is given: `user.set_unusable_password()` — Django's own
  correct way to represent "this account has no password." Django's
  ModelBackend will never authenticate this user via any password
  (including an empty string), which is exactly the semantics we want —
  much safer than storing '' or None and hoping nothing ever checks it.
- The device that registered holds the only copy of that account's JWTs.
  No password + no verified email = no way to log in on a different
  device or after reinstalling. That tradeoff is surfaced to the user in
  the app (not hidden), and is exactly why email verification / password
  creation exist as opt-in upgrades available any time from Settings.
- IF a password IS provided at registration (or later, from Settings —
  same validate_password() call either way), it's validated against
  Django's already-configured AUTH_PASSWORD_VALIDATORS
  (config/settings.py) and stored the normal, correctly-hashed way.

COPPA AGE GATE:
------------------------------------------------------------------------
COPPA's line is 13 — under-13 registration is hard-blocked here with a
clear validation error, no account created at all. (Full COPPA
compliance for a real product would also need a verifiable-parental-
consent flow for under-13 users who WANT to use the app — that's a much
bigger feature than "block registration," and isn't what's being built
right now; flagging this only so nobody reads "hard block" as "the whole
COPPA question is solved.")
"""
import secrets

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from users.services import issue_email_verification_token, send_verification_email

MINIMUM_AGE_YEARS = 13


def _generate_unique_username() -> str:
    """
    auth.User requires a unique `username`, but nothing in this app is
    ever shown one, or logs in with one — it's purely an internal key.
    `user_<12 random hex chars>` (48 bits of randomness) is
    astronomically unlikely to collide, but we still retry on the
    vanishingly rare chance of one, rather than assuming it can never
    happen.
    """
    for _ in range(5):
        candidate = f"user_{secrets.token_hex(6)}"
        if not User.objects.filter(username=candidate).exists():
            return candidate
    # If we somehow failed 5 times in a row, something is very wrong
    # (or someone is deliberately trying to exhaust this) — fail loudly
    # rather than silently using a possibly-colliding value.
    raise RuntimeError("Could not generate a unique username after 5 attempts.")


class RegistrationSerializer(serializers.Serializer):
    """Not a ModelSerializer — registration spans TWO models (User +
    UserProfile) plus side effects (sending an email), which is exactly
    the kind of multi-step write ModelSerializer isn't a good fit for.
    Validates input, `save()` does the actual multi-model work."""

    date_of_birth = serializers.DateField(
        required=True,
        error_messages={
            "invalid": "Enter your date of birth as a valid date.",
        },
    )
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(
        required=False, allow_blank=True, default="", write_only=True, trim_whitespace=False
    )

    def validate_date_of_birth(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("Date of birth can't be in the future.")

        today = timezone.now().date()
        had_birthday_this_year = (today.month, today.day) >= (value.month, value.day)
        age = today.year - value.year - (0 if had_birthday_this_year else 1)

        if age < MINIMUM_AGE_YEARS:
            raise serializers.ValidationError(
                f"You must be at least {MINIMUM_AGE_YEARS} years old to use Syncate."
            )
        return value

    def validate_email(self, value):
        if not value:
            return value

        normalized = value.strip().lower()

        # A friendlier 400 here than letting it fall through to the raw
        # database constraint (see migrations/0002...) and surface as a
        # generic 500 IntegrityError — same layered-validation pattern
        # used for LegalDocument.version (app-level check for a clean
        # error, DB constraint as the real, race-proof backstop).
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_password(self, value):
        if not value:
            return value
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]

        with transaction.atomic():
            user = User(username=_generate_unique_username(), email=email)

            if password:
                user.set_password(password)
            else:
                # The correct, Django-native way to say "no password
                # exists for this account" — see module docstring.
                user.set_unusable_password()

            user.save()

            # users/signals.py's post_save hook already created an empty
            # UserProfile the moment user.save() ran above — just fill it
            # in rather than creating a second one.
            profile = user.profile
            profile.date_of_birth = validated_data["date_of_birth"]
            profile.save(update_fields=["date_of_birth", "updated_at"])

            if email:
                token = issue_email_verification_token(user, email)
            else:
                token = None

        # Sending the email happens OUTSIDE the atomic block on purpose —
        # if the email provider hiccups, we don't want to roll back an
        # otherwise-successful registration. The user can always request
        # a fresh verification link from Settings if this particular send
        # fails.
        if token:
            send_verification_email(token)

        return user
