from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    BACKEND_PUBLIC_URL="https://syncate.test",
)
class ProfileApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="profile_user",
            email="",
        )
        self.profile, _ = UserProfile.objects.get_or_create(
            user=self.user,
        )
        self.profile.nickname = "Maya"
        self.profile.save(update_fields=["nickname", "updated_at"])

        self.profile_url = "/api/users/me/profile/"
        self.email_url = "/api/users/me/email/"

    def authenticate(self):
        self.client.force_authenticate(user=self.user)

    def test_profile_requires_authentication(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_profile_returns_nickname_and_optional_email(self):
        self.authenticate()

        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["nickname"], "Maya")
        self.assertEqual(response.data["email"], "")
        self.assertFalse(response.data["is_email_verified"])

    def test_user_can_add_email_and_verification_is_sent(self):
        self.authenticate()

        response = self.client.patch(
            self.email_url,
            {"email": "Maya@Example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        self.assertEqual(self.user.email, "maya@example.com")
        self.assertFalse(self.profile.is_email_verified)
        self.assertTrue(response.data["email_verification_sent"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["maya@example.com"])

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="someone_else",
            email="taken@example.com",
        )
        self.authenticate()

        response = self.client.patch(
            self.email_url,
            {"email": "TAKEN@example.com"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_same_unverified_email_can_request_fresh_verification(self):
        self.user.email = "pending@example.com"
        self.user.save(update_fields=["email"])
        self.profile.is_email_verified = False
        self.profile.save(
            update_fields=["is_email_verified", "updated_at"]
        )
        self.authenticate()

        response = self.client.patch(
            self.email_url,
            {"email": "pending@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["email_verification_sent"])
        self.assertEqual(len(mail.outbox), 1)

    def test_verified_email_can_be_changed(self):
        self.user.email = "verified@example.com"
        self.user.save(update_fields=["email"])
        self.profile.is_email_verified = True
        self.profile.save(
            update_fields=["is_email_verified", "updated_at"]
        )
        self.authenticate()

        response = self.client.patch(
            self.email_url,
            {"email": "other@example.com"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        self.assertEqual(self.user.email, "other@example.com")
        self.assertFalse(self.profile.is_email_verified)
        self.assertTrue(response.data["email_verification_sent"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["other@example.com"])

    def test_unverified_email_can_be_changed(self):
        self.user.email = "old@example.com"
        self.user.save(update_fields=["email"])
        self.profile.is_email_verified = False
        self.profile.save(update_fields=["is_email_verified", "updated_at"])
        self.authenticate()

        response = self.client.patch(
            self.email_url,
            {"email": "new@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.profile.refresh_from_db()

        self.assertEqual(self.user.email, "new@example.com")
        self.assertFalse(self.profile.is_email_verified)
        self.assertEqual(mail.outbox[0].to, ["new@example.com"])
