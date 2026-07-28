"""
registration/tests.py

Covers the rules that actually matter for this endpoint:
1. Under-13 registration is hard-blocked.
2. 13+ registration succeeds with just a date of birth — no email, no
   password required.
3. Providing an email sends a verification email and creates a usable
   token; the account itself still works immediately either way.
4. Duplicate email (including different casing) is rejected.
5. A weak password is rejected via Django's own validators; a good one
   is accepted and actually usable for login later.
6. Registration issues a working JWT pair immediately.
"""
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from users.models import EmailVerificationToken


def dob_for_age(years: int) -> str:
    """Returns an ISO date string for someone who just turned `years` old
    today — the exact boundary is what actually exercises the COPPA
    check, not some date comfortably on one side of it."""
    today = date.today()
    return date(today.year - years, today.month, today.day).isoformat()


class RegistrationCOPPATests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/register/"

    def test_under_13_is_rejected(self):
        response = self.client.post(self.url, {"date_of_birth": dob_for_age(12)})
        self.assertEqual(response.status_code, 400)
        self.assertIn("date_of_birth", response.data)
        self.assertEqual(User.objects.count(), 0)

    def test_exactly_13_is_accepted(self):
        response = self.client.post(self.url, {"date_of_birth": dob_for_age(13)})
        self.assertEqual(response.status_code, 201)

    def test_future_date_of_birth_is_rejected(self):
        future = (date.today() + timedelta(days=1)).isoformat()
        response = self.client.post(self.url, {"date_of_birth": future})
        self.assertEqual(response.status_code, 400)


class RegistrationEmailOptionalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/register/"

    def test_registration_without_email_succeeds(self):
        response = self.client.post(self.url, {"date_of_birth": dob_for_age(20)})
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["user"]["email_verification_sent"])
        self.assertEqual(len(mail.outbox), 0)

        user = User.objects.get(pk=response.data["user"]["id"])
        self.assertFalse(user.has_usable_password())
        self.assertFalse(user.profile.is_email_verified)

    def test_registration_with_email_sends_verification(self):
        response = self.client.post(
            self.url, {"date_of_birth": dob_for_age(20), "email": "new@example.com"}
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["user"]["email_verification_sent"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("new@example.com", mail.outbox[0].to)

        token = EmailVerificationToken.objects.get(email="new@example.com")
        self.assertTrue(token.is_valid)

    def test_duplicate_email_rejected_case_insensitively(self):
        self.client.post(
            self.url, {"date_of_birth": dob_for_age(20), "email": "same@example.com"}
        )
        response = self.client.post(
            self.url, {"date_of_birth": dob_for_age(21), "email": "SAME@example.com"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)
        self.assertEqual(User.objects.count(), 1)


class RegistrationPasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/register/"

    def test_weak_password_rejected(self):
        response = self.client.post(
            self.url, {"date_of_birth": dob_for_age(20), "password": "12345678"}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.data)
        self.assertEqual(User.objects.count(), 0)

    def test_strong_password_accepted_and_usable(self):
        response = self.client.post(
            self.url,
            {
                "date_of_birth": dob_for_age(20),
                "email": "hasapassword@example.com",
                "password": "a-genuinely-long-passphrase-99",
            },
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(pk=response.data["user"]["id"])
        self.assertTrue(user.has_usable_password())
        self.assertTrue(user.check_password("a-genuinely-long-passphrase-99"))


class RegistrationJWTTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/register/"

    def test_registration_issues_working_access_token(self):
        response = self.client.post(self.url, {"date_of_birth": dob_for_age(20)})
        self.assertEqual(response.status_code, 201)
        access = response.data["access"]
        self.assertTrue(response.data["refresh"])

        # Prove it's actually usable, not just present in the response —
        # hit a normal authenticated-only check via the token.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        # legal_docs' admin endpoint requires IsAdminUser, so an ordinary
        # registered user should be forbidden (403), NOT unauthorized
        # (401) — 403 proves the token itself was accepted and identified
        # a real, non-staff user.
        admin_response = self.client.get("/api/admin/legal-documents/")
        self.assertEqual(admin_response.status_code, 403)
