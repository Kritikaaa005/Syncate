"""
Tests for the users application.

Includes:
- Tracking-mode preference updates
- Email verification
- Login
- Soft account deletion
- Refresh-token blacklisting
"""

from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .services import (
    consume_email_verification_token,
    deactivate_account,
    issue_email_verification_token,
)


class UpdateTrackingModeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="syncate_test_user",
            email="test@syncate.com",
            password="StrongPassword123!",
        )

        self.profile, _ = (
            UserProfile.objects.get_or_create(
                user=self.user,
            )
        )

        self.profile.nickname = "Aadhya✨"
        self.profile.save(
            update_fields=["nickname"]
        )

        refresh = RefreshToken.for_user(
            self.user
        )

        self.access_token = str(
            refresh.access_token
        )

        self.url = reverse(
            "update-tracking-mode"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Bearer {self.access_token}"
            )
        )

    def test_unauthenticated_user_cannot_update_tracking_mode(
        self,
    ):
        response = self.client.patch(
            self.url,
            {
                "tracking_mode": "period",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_select_period_tracking(
        self,
    ):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "tracking_mode": "period",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.profile.refresh_from_db()

        self.assertEqual(
            self.profile.tracking_mode,
            UserProfile.TrackingMode.PERIOD,
        )

        self.assertEqual(
            response.data["tracking_mode"],
            "period",
        )

        self.assertEqual(
            response.data[
                "tracking_mode_label"
            ],
            "Period Tracking",
        )

    def test_authenticated_user_can_select_pregnancy_tracking(
        self,
    ):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "tracking_mode": "pregnancy",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.profile.refresh_from_db()

        self.assertEqual(
            self.profile.tracking_mode,
            (
                UserProfile
                .TrackingMode
                .PREGNANCY
            ),
        )

        self.assertEqual(
            response.data[
                "tracking_mode_label"
            ],
            "Pregnancy Tracking",
        )

    def test_invalid_tracking_mode_is_rejected(
        self,
    ):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "tracking_mode": "fitness",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.profile.refresh_from_db()

        self.assertEqual(
            self.profile.tracking_mode,
            "",
        )

    def test_empty_tracking_mode_is_rejected(
        self,
    ):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "tracking_mode": "",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_tracking_mode_is_rejected(
        self,
    ):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_user_can_change_tracking_mode(
        self,
    ):
        self.authenticate()

        first_response = self.client.patch(
            self.url,
            {
                "tracking_mode": "period",
            },
            format="json",
        )

        second_response = (
            self.client.patch(
                self.url,
                {
                    "tracking_mode": (
                        "pregnancy"
                    ),
                },
                format="json",
            )
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_200_OK,
        )

        self.profile.refresh_from_db()

        self.assertEqual(
            self.profile.tracking_mode,
            (
                UserProfile
                .TrackingMode
                .PREGNANCY
            ),
        )


def make_verified_user_with_password(
    email="verified@example.com",
    password="a-strong-passphrase-42",
):
    user = User.objects.create_user(
        username="testuser",
        email=email,
        password=password,
    )

    profile, _ = (
        UserProfile.objects.get_or_create(
            user=user,
        )
    )

    profile.date_of_birth = date(
        2000,
        1,
        1,
    )

    profile.is_email_verified = True

    profile.save(
        update_fields=[
            "date_of_birth",
            "is_email_verified",
        ]
    )

    return user


class EmailVerificationTests(TestCase):
    def test_valid_token_verifies_and_marks_used(
        self,
    ):
        user = User.objects.create_user(
            username="u1",
            email="a@example.com",
        )

        token = (
            issue_email_verification_token(
                user,
                "a@example.com",
            )
        )

        result = (
            consume_email_verification_token(
                token.token
            )
        )

        self.assertIsNotNone(result)

        user.profile.refresh_from_db()

        self.assertTrue(
            user.profile.is_email_verified
        )

        token.refresh_from_db()

        self.assertIsNotNone(
            token.used_at
        )

    def test_token_cannot_be_used_twice(
        self,
    ):
        user = User.objects.create_user(
            username="u2",
            email="b@example.com",
        )

        token = (
            issue_email_verification_token(
                user,
                "b@example.com",
            )
        )

        first = (
            consume_email_verification_token(
                token.token
            )
        )

        second = (
            consume_email_verification_token(
                token.token
            )
        )

        self.assertIsNotNone(first)
        self.assertIsNone(second)

    def test_expired_token_is_rejected(
        self,
    ):
        user = User.objects.create_user(
            username="u3",
            email="c@example.com",
        )

        token = (
            issue_email_verification_token(
                user,
                "c@example.com",
            )
        )

        token.expires_at = (
            timezone.now()
            - timedelta(hours=1)
        )

        token.save(
            update_fields=["expires_at"]
        )

        result = (
            consume_email_verification_token(
                token.token
            )
        )

        self.assertIsNone(result)

    def test_nonexistent_token_is_rejected(
        self,
    ):
        result = (
            consume_email_verification_token(
                "this-token-does-not-exist"
            )
        )

        self.assertIsNone(result)

    def test_requesting_new_token_invalidates_old_token(
        self,
    ):
        user = User.objects.create_user(
            username="u4",
            email="d@example.com",
        )

        old_token = (
            issue_email_verification_token(
                user,
                "d@example.com",
            )
        )

        new_token = (
            issue_email_verification_token(
                user,
                "d@example.com",
            )
        )

        self.assertNotEqual(
            old_token.token,
            new_token.token,
        )

        self.assertIsNone(
            consume_email_verification_token(
                old_token.token
            )
        )

        self.assertIsNotNone(
            consume_email_verification_token(
                new_token.token
            )
        )


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/login/"

    def test_login_with_correct_credentials_succeeds(
        self,
    ):
        make_verified_user_with_password(
            email="login@example.com",
            password=(
                "a-strong-passphrase-42"
            ),
        )

        response = self.client.post(
            self.url,
            {
                "email": "login@example.com",
                "password": (
                    "a-strong-passphrase-42"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "access",
            response.data,
        )

        self.assertIn(
            "refresh",
            response.data,
        )

    def test_login_is_case_insensitive_on_email(
        self,
    ):
        make_verified_user_with_password(
            email="Login@Example.com",
            password=(
                "a-strong-passphrase-42"
            ),
        )

        response = self.client.post(
            self.url,
            {
                "email": "login@example.com",
                "password": (
                    "a-strong-passphrase-42"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_wrong_password_rejected(
        self,
    ):
        make_verified_user_with_password(
            email="login2@example.com",
            password=(
                "a-strong-passphrase-42"
            ),
        )

        response = self.client.post(
            self.url,
            {
                "email": (
                    "login2@example.com"
                ),
                "password": (
                    "totally-wrong"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_login_does_not_reveal_if_email_exists(
        self,
    ):
        make_verified_user_with_password(
            email="real@example.com",
            password=(
                "a-strong-passphrase-42"
            ),
        )

        wrong_password = self.client.post(
            self.url,
            {
                "email": "real@example.com",
                "password": "nope",
            },
            format="json",
        )

        no_such_account = (
            self.client.post(
                self.url,
                {
                    "email": (
                        "nobody@example.com"
                    ),
                    "password": "nope",
                },
                format="json",
            )
        )

        self.assertEqual(
            wrong_password.status_code,
            no_such_account.status_code,
        )

        self.assertEqual(
            wrong_password.data,
            no_such_account.data,
        )

    def test_account_without_password_cannot_login(
        self,
    ):
        user = User.objects.create_user(
            username="nopass",
            email="nopass@example.com",
        )

        user.set_unusable_password()
        user.save(
            update_fields=["password"]
        )

        profile, _ = (
            UserProfile.objects.get_or_create(
                user=user,
            )
        )

        profile.is_email_verified = True

        profile.save(
            update_fields=[
                "is_email_verified"
            ]
        )

        response = self.client.post(
            self.url,
            {
                "email": (
                    "nopass@example.com"
                ),
                "password": "anything",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


class SoftDeleteAndTokenBlacklistTests(
    TestCase
):
    def test_deactivate_account_blacklists_outstanding_tokens(
        self,
    ):
        user = (
            make_verified_user_with_password()
        )

        refresh = RefreshToken.for_user(
            user
        )

        outstanding = (
            OutstandingToken.objects.get(
                jti=refresh["jti"]
            )
        )

        deactivate_account(user)

        user.refresh_from_db()
        user.profile.refresh_from_db()

        self.assertTrue(
            user.profile.is_deleted
        )

        self.assertFalse(
            user.is_active
        )

        self.assertTrue(
            BlacklistedToken.objects.filter(
                token=outstanding
            ).exists()
        )


class SetPasswordTests(APITestCase):
    """
    Covers users/serializers.py::SetPasswordSerializer and
    users/views.py::SetPasswordView — both the "add a password to a
    passwordless account" and "change an existing password" paths,
    since the server (not the client) decides which one applies.
    """

    url = "/api/users/me/password/"

    def setUp(self):
        # The password-change throttle is keyed by user pk and lives in
        # Django's cache, which — unlike the DB — is NOT reset by
        # TestCase's per-test transaction rollback. Left alone, an
        # earlier test's throttle hits could bleed into a later one
        # (most visibly if the DB backend reuses primary keys across
        # rolled-back transactions, e.g. SQLite). Clearing it here
        # keeps each test's throttle count independent regardless of
        # the underlying DB engine.
        from django.core.cache import cache
        cache.clear()

    def _auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return {"HTTP_AUTHORIZATION": f"Bearer {access_token}"}

    def test_adding_password_to_passwordless_account_succeeds(self):
        user = User.objects.create_user(
            username="nopass_settings",
            email="nopass-settings@example.com",
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])

        response = self.client.patch(
            self.url,
            {
                "new_password": "a-brand-new-passphrase-9",
                "confirm_password": "a-brand-new-passphrase-9",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.has_usable_password())
        self.assertTrue(
            user.check_password("a-brand-new-passphrase-9")
        )

    def test_adding_password_does_not_require_current_password(self):
        """A passwordless account has nothing to confirm — sending no
        current_password at all must not be treated as a validation
        error just because the field exists on the serializer."""
        user = User.objects.create_user(
            username="nopass_settings2",
            email="nopass-settings2@example.com",
        )
        user.set_unusable_password()
        user.save(update_fields=["password"])

        response = self.client.patch(
            self.url,
            {
                "current_password": "",
                "new_password": "another-fresh-passphrase-7",
                "confirm_password": "another-fresh-passphrase-7",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_changing_existing_password_requires_correct_current_password(self):
        user = make_verified_user_with_password(
            email="haspass@example.com",
            password="the-original-passphrase-1",
        )

        response = self.client.patch(
            self.url,
            {
                "current_password": "wrong-guess",
                "new_password": "the-replacement-passphrase-2",
                "confirm_password": "the-replacement-passphrase-2",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("current_password", response.data)

        user.refresh_from_db()
        self.assertTrue(
            user.check_password("the-original-passphrase-1")
        )

    def test_changing_existing_password_succeeds_with_correct_current_password(self):
        user = make_verified_user_with_password(
            email="haspass2@example.com",
            password="the-original-passphrase-3",
        )

        response = self.client.patch(
            self.url,
            {
                "current_password": "the-original-passphrase-3",
                "new_password": "the-replacement-passphrase-4",
                "confirm_password": "the-replacement-passphrase-4",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(
            user.check_password("the-replacement-passphrase-4")
        )

    def test_mismatched_confirmation_rejected(self):
        user = make_verified_user_with_password(
            email="haspass3@example.com",
            password="the-original-passphrase-5",
        )

        response = self.client.patch(
            self.url,
            {
                "current_password": "the-original-passphrase-5",
                "new_password": "one-new-passphrase-6",
                "confirm_password": "a-different-passphrase-6",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("confirm_password", response.data)

    def test_weak_new_password_rejected(self):
        user = make_verified_user_with_password(
            email="haspass4@example.com",
            password="the-original-passphrase-7",
        )

        response = self.client.patch(
            self.url,
            {
                "current_password": "the-original-passphrase-7",
                "new_password": "12345678",
                "confirm_password": "12345678",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("new_password", response.data)

    def test_new_password_same_as_current_rejected(self):
        user = make_verified_user_with_password(
            email="haspass5@example.com",
            password="the-original-passphrase-8",
        )

        response = self.client.patch(
            self.url,
            {
                "current_password": "the-original-passphrase-8",
                "new_password": "the-original-passphrase-8",
                "confirm_password": "the-original-passphrase-8",
            },
            format="json",
            **self._auth_headers(user),
        )

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("new_password", response.data)

    def test_unauthenticated_request_rejected(self):
        response = self.client.patch(
            self.url,
            {
                "new_password": "irrelevant-passphrase-0",
                "confirm_password": "irrelevant-passphrase-0",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code, status.HTTP_401_UNAUTHORIZED
        )