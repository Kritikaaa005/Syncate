"""
users/tests.py

Covers the parts of the account lifecycle that live in THIS app:
email verification (issue/consume/expire/reuse-blocked), login (the two
optional-upgrade paths), and the soft-delete + token-blacklist flow.
COPPA/registration-input tests live in registration/tests.py instead —
this file assumes an account already exists.
"""
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationToken
from .services import (
    consume_email_verification_token,
    deactivate_account,
    issue_email_verification_token,
)


def make_verified_user_with_password(email="verified@example.com", password="a-strong-passphrase-42"):
    user = User.objects.create_user(username="testuser", email=email, password=password)
    user.profile.date_of_birth = date(2000, 1, 1)
    user.profile.is_email_verified = True
    user.profile.save()
    return user


class EmailVerificationTests(TestCase):
    def test_valid_token_verifies_and_marks_used(self):
        user = User.objects.create_user(username="u1", email="a@example.com")
        token = issue_email_verification_token(user, "a@example.com")

        result = consume_email_verification_token(token.token)

        self.assertIsNotNone(result)
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.is_email_verified)

        token.refresh_from_db()
        self.assertIsNotNone(token.used_at)

    def test_token_cannot_be_used_twice(self):
        user = User.objects.create_user(username="u2", email="b@example.com")
        token = issue_email_verification_token(user, "b@example.com")

        first = consume_email_verification_token(token.token)
        second = consume_email_verification_token(token.token)

        self.assertIsNotNone(first)
        self.assertIsNone(second)  # already used -> rejected

    def test_expired_token_is_rejected(self):
        user = User.objects.create_user(username="u3", email="c@example.com")
        token = issue_email_verification_token(user, "c@example.com")
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()

        result = consume_email_verification_token(token.token)
        self.assertIsNone(result)

    def test_nonexistent_token_is_rejected(self):
        result = consume_email_verification_token("this-token-does-not-exist")
        self.assertIsNone(result)

    def test_requesting_a_new_token_invalidates_the_old_one(self):
        user = User.objects.create_user(username="u4", email="d@example.com")
        old_token = issue_email_verification_token(user, "d@example.com")
        new_token = issue_email_verification_token(user, "d@example.com")

        self.assertNotEqual(old_token.token, new_token.token)
        # old one should now be unusable even though it never expired and
        # nobody explicitly clicked it
        self.assertIsNone(consume_email_verification_token(old_token.token))
        # new one still works
        self.assertIsNotNone(consume_email_verification_token(new_token.token))


class LoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/login/"

    def test_login_with_correct_credentials_succeeds(self):
        make_verified_user_with_password(email="login@example.com", password="a-strong-passphrase-42")
        response = self.client.post(
            self.url, {"email": "login@example.com", "password": "a-strong-passphrase-42"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_is_case_insensitive_on_email(self):
        make_verified_user_with_password(email="Login@Example.com", password="a-strong-passphrase-42")
        response = self.client.post(
            self.url, {"email": "login@example.com", "password": "a-strong-passphrase-42"}
        )
        self.assertEqual(response.status_code, 200)

    def test_wrong_password_rejected(self):
        make_verified_user_with_password(email="login2@example.com", password="a-strong-passphrase-42")
        response = self.client.post(
            self.url, {"email": "login2@example.com", "password": "totally-wrong"}
        )
        self.assertEqual(response.status_code, 401)

    def test_login_does_not_reveal_whether_email_exists(self):
        """Wrong-password and no-such-account should look identical to the
        caller — same status code, same generic message — so this
        endpoint can't be used to enumerate registered emails."""
        make_verified_user_with_password(email="real@example.com", password="a-strong-passphrase-42")

        wrong_password = self.client.post(
            self.url, {"email": "real@example.com", "password": "nope"}
        )
        no_such_account = self.client.post(
            self.url, {"email": "nobody@example.com", "password": "nope"}
        )

        self.assertEqual(wrong_password.status_code, no_such_account.status_code)
        self.assertEqual(wrong_password.data, no_such_account.data)

    def test_account_without_password_cannot_login(self):
        user = User.objects.create_user(username="nopass", email="nopass@example.com")
        user.set_unusable_password()
        user.save()
        user.profile.is_email_verified = True
        user.profile.save()

        response = self.client.post(
            self.url, {"email": "nopass@example.com", "password": "anything"}
        )
        self.assertEqual(response.status_code, 401)


class SoftDeleteAndTokenBlacklistTests(TestCase):
    def test_deactivate_account_blacklists_outstanding_tokens(self):
        user = make_verified_user_with_password()
        refresh = RefreshToken.for_user(user)
        # With rest_framework_simplejwt.token_blacklist installed,
        # for_user() already auto-creates the OutstandingToken row for
        # this refresh token — just look it up rather than creating a
        # second (duplicate-jti) one ourselves.
        outstanding = OutstandingToken.objects.get(jti=refresh["jti"])

        deactivate_account(user)

        user.refresh_from_db()
        user.profile.refresh_from_db()
        self.assertTrue(user.profile.is_deleted)
        self.assertFalse(user.is_active)
        self.assertTrue(BlacklistedToken.objects.filter(token=outstanding).exists())
