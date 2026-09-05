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
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from io import StringIO

from cycle_tracking.models import CycleProfile
from legal_docs.models import LegalDocumentAcceptance

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

    def test_unauthenticated_user_cannot_read_tracking_mode(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_read_period_tracking(self):
        self.profile.tracking_mode = UserProfile.TrackingMode.PERIOD
        self.profile.save(update_fields=["tracking_mode"])
        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tracking_mode"], "period")
        self.assertEqual(
            response.data["tracking_mode_label"],
            "Period Tracking",
        )

    def test_authenticated_user_can_read_existing_pregnancy_tracking(self):
        self.profile.tracking_mode = UserProfile.TrackingMode.PREGNANCY
        self.profile.save(update_fields=["tracking_mode"])
        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tracking_mode"], "pregnancy")
        self.assertEqual(
            response.data["tracking_mode_label"],
            "Pregnancy Tracking",
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


class AccountDeactivationAPITests(APITestCase):
    def setUp(self):
        self.user = make_verified_user_with_password()
        self.other_user = User.objects.create_user(
            username="other_user",
            email="other@example.com",
            password="StrongPassword123!",
        )
        self.url = reverse("deactivate-account")

    def test_new_profile_defaults_to_active_with_registered_date(self):
        profile = self.other_user.profile
        self.assertTrue(profile.is_active)
        self.assertIsNotNone(profile.registered_date)

    def test_unauthenticated_request_is_rejected(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_deactivation_is_soft_and_only_affects_current_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        profile = UserProfile.objects.get(user=self.user)
        self.other_user.refresh_from_db()
        self.other_user.profile.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertFalse(profile.is_active)
        self.assertTrue(profile.is_deleted)
        self.assertIsNone(profile.deletion_due_at)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())
        self.assertTrue(UserProfile.objects.filter(pk=profile.pk).exists())
        self.assertTrue(self.other_user.is_active)
        self.assertTrue(self.other_user.profile.is_active)

    def test_deactivated_user_cannot_log_in(self):
        self.client.force_authenticate(user=self.user)
        self.client.delete(self.url)
        self.client.force_authenticate(user=None)
        response = self.client.post(
            reverse("login"),
            {"email": self.user.email, "password": "a-strong-passphrase-42"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DeletionLifecycleTests(APITestCase):
    def setUp(self):
        self.password = "a-strong-passphrase-42"
        self.user = make_verified_user_with_password(
            email="lifecycle@example.com",
            password=self.password,
        )

    def test_schedule_deletion_and_scheduled_login(self):
        self.client.force_authenticate(user=self.user)
        before = timezone.now()
        response = self.client.post(reverse("schedule-account-deletion"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertFalse(self.user.profile.is_active)
        self.assertIsNotNone(self.user.profile.deletion_requested_at)
        self.assertAlmostEqual(
            self.user.profile.deletion_due_at,
            before + timedelta(days=30),
            delta=timedelta(seconds=2),
        )
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

        self.client.force_authenticate(user=None)
        login_response = self.client.post(
            reverse("login"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(login_response.data["code"], "ACCOUNT_SCHEDULED_FOR_DELETION")

    def test_unauthenticated_schedule_and_permanent_delete_are_rejected(self):
        self.assertEqual(
            self.client.post(reverse("schedule-account-deletion")).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
        self.assertEqual(
            self.client.delete(reverse("permanent-delete-account")).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_restore_during_grace_period_issues_tokens(self):
        self.client.force_authenticate(user=self.user)
        self.client.post(reverse("schedule-account-deletion"))
        self.client.force_authenticate(user=None)
        response = self.client.post(
            reverse("restore-scheduled-account"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertTrue(self.user.profile.is_active)
        self.assertFalse(self.user.profile.is_deleted)
        self.assertIsNone(self.user.profile.deletion_requested_at)
        self.assertIsNone(self.user.profile.deletion_due_at)

    def test_restore_after_expiry_is_rejected(self):
        profile = self.user.profile
        profile.is_active = False
        profile.is_deleted = True
        profile.deletion_requested_at = timezone.now() - timedelta(days=31)
        profile.deletion_due_at = timezone.now() - timedelta(days=1)
        profile.save()
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])
        response = self.client.post(
            reverse("restore-scheduled-account"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_permanent_delete_cascades_owned_data(self):
        CycleProfile.objects.create(user=self.user)
        LegalDocumentAcceptance.objects.create(
            user=self.user,
            doc_type="registered_terms",
            version="1.0",
        )
        user_id = self.user.pk
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(reverse("permanent-delete-account"))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=user_id).exists())
        self.assertFalse(UserProfile.objects.filter(user_id=user_id).exists())
        self.assertFalse(CycleProfile.objects.filter(user_id=user_id).exists())
        self.assertFalse(LegalDocumentAcceptance.objects.filter(user_id=user_id).exists())


class PurgeExpiredAccountsCommandTests(TestCase):
    def make_user(self, username, due_at):
        user = User.objects.create_user(username=username)
        profile = user.profile
        profile.is_active = False
        profile.is_deleted = True
        profile.deletion_due_at = due_at
        profile.deletion_requested_at = due_at - timedelta(days=30) if due_at else None
        profile.save()
        user.is_active = False
        user.save(update_fields=["is_active"])
        return user

    def test_command_only_purges_expired_scheduled_accounts(self):
        expired = self.make_user("expired", timezone.now() - timedelta(minutes=1))
        future = self.make_user("future", timezone.now() + timedelta(days=1))
        ordinary = self.make_user("ordinary", None)
        output = StringIO()
        call_command("purge_expired_accounts", stdout=output)
        self.assertFalse(User.objects.filter(pk=expired.pk).exists())
        self.assertTrue(User.objects.filter(pk=future.pk).exists())
        self.assertTrue(User.objects.filter(pk=ordinary.pk).exists())
        self.assertIn("Purged 1 expired account(s).", output.getvalue())


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
            user.profile.is_active
        )

        self.assertFalse(
            user.is_active
        )

        self.assertTrue(
            BlacklistedToken.objects.filter(
                token=outstanding
            ).exists()
        )
