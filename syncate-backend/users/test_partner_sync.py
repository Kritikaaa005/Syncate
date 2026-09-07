from datetime import date, timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from registration.serializers import RegistrationSerializer

from .models import UserPartner


def adult_date_of_birth():
    today = date.today()
    return date(today.year - 20, today.month, today.day).isoformat()


class PartnerSyncTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.primary = User.objects.create_user(username="primary")
        self.generate_url = "/api/users/partner/code/"
        self.validate_url = "/api/users/partner/validate-code/"
        self.register_url = "/api/users/partner/register/"

    def authenticate_primary(self):
        self.client.force_authenticate(self.primary)

    def generate_code(self):
        self.authenticate_primary()
        return self.client.post(self.generate_url, {}, format="json")

    def partner_payload(self, code, **overrides):
        payload = {
            "code": code,
            "nickname": "Sam",
            "date_of_birth": adult_date_of_birth(),
        }
        payload.update(overrides)
        return payload

    def test_first_generation_creates_24_hour_invitation(self):
        before = timezone.now()
        response = self.generate_code()
        after = timezone.now()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        relationship = UserPartner.objects.get(user=self.primary)
        self.assertEqual(relationship.code, response.data["code"])
        self.assertEqual(relationship.counter, 1)
        self.assertIsNone(relationship.partner)
        self.assertGreaterEqual(
            relationship.expiration_date,
            before + timedelta(hours=24),
        )
        self.assertLessEqual(
            relationship.expiration_date,
            after + timedelta(hours=24),
        )

    def test_generation_requires_authentication(self):
        response = self.client.post(self.generate_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regeneration_reuses_row_replaces_code_and_increments_counter(self):
        first = self.generate_code()
        relationship_id = UserPartner.objects.get(user=self.primary).pk
        first_expiration = UserPartner.objects.get(pk=relationship_id).expiration_date

        second = self.generate_code()
        relationship = UserPartner.objects.get(pk=relationship_id)

        self.assertEqual(UserPartner.objects.filter(user=self.primary).count(), 1)
        self.assertNotEqual(first.data["code"], second.data["code"])
        self.assertEqual(relationship.counter, 2)
        self.assertGreaterEqual(relationship.expiration_date, first_expiration)

        old_code_response = self.client.post(
            self.validate_url,
            {"code": first.data["code"]},
            format="json",
        )
        self.assertEqual(old_code_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_generation_after_expiry_reuses_row_and_increments_counter(self):
        first = self.generate_code()
        relationship = UserPartner.objects.get(user=self.primary)
        relationship.expiration_date = timezone.now() - timedelta(seconds=1)
        relationship.save(update_fields=["expiration_date"])

        second = self.generate_code()
        relationship.refresh_from_db()

        self.assertNotEqual(first.data["code"], second.data["code"])
        self.assertEqual(relationship.counter, 2)
        self.assertGreater(relationship.expiration_date, timezone.now())

    def test_valid_code_is_accepted_without_incrementing_counter(self):
        generated = self.generate_code()
        self.client.force_authenticate(user=None)
        response = self.client.post(
            self.validate_url,
            {"code": f"  {generated.data['code'].lower()}  "},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"valid": True})
        self.assertEqual(UserPartner.objects.get(user=self.primary).counter, 1)

    def test_unknown_and_expired_codes_are_rejected(self):
        unknown = self.client.post(
            self.validate_url,
            {"code": "ABCDEFGH"},
            format="json",
        )
        self.assertEqual(unknown.status_code, status.HTTP_400_BAD_REQUEST)

        generated = self.generate_code()
        relationship = UserPartner.objects.get(user=self.primary)
        relationship.expiration_date = timezone.now()
        relationship.save(update_fields=["expiration_date"])
        self.client.force_authenticate(user=None)

        expired = self.client.post(
            self.validate_url,
            {"code": generated.data["code"]},
            format="json",
        )
        self.assertEqual(expired.status_code, status.HTTP_400_BAD_REQUEST)

    def test_partner_registration_links_account_consumes_code_and_returns_tokens(self):
        generated = self.generate_code()
        self.client.force_authenticate(user=None)

        response = self.client.post(
            self.register_url,
            self.partner_payload(
                generated.data["code"],
                email="partner@example.com",
                password="a-genuinely-long-passphrase-99",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        relationship = UserPartner.objects.get(user=self.primary)
        partner = relationship.partner
        self.assertEqual(partner.profile.nickname, "Sam")
        self.assertEqual(partner.profile.date_of_birth.isoformat(), adult_date_of_birth())
        self.assertTrue(partner.check_password("a-genuinely-long-passphrase-99"))
        self.assertIsNone(relationship.code)
        self.assertIsNone(relationship.expiration_date)
        self.assertIsNotNone(relationship.linked_at)
        self.assertEqual(relationship.counter, 1)

    def test_consumed_code_cannot_be_reused_or_replaced(self):
        generated = self.generate_code()
        self.client.force_authenticate(user=None)
        first = self.client.post(
            self.register_url,
            self.partner_payload(generated.data["code"]),
            format="json",
        )
        second = self.client.post(
            self.register_url,
            self.partner_payload(generated.data["code"], nickname="Alex"),
            format="json",
        )

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)

        self.authenticate_primary()
        generation = self.client.post(self.generate_url, {}, format="json")
        self.assertEqual(generation.status_code, status.HTTP_409_CONFLICT)

    def test_database_prevents_one_partner_from_linking_to_two_users(self):
        partner = User.objects.create_user(username="partner")
        other_primary = User.objects.create_user(username="other-primary")
        UserPartner.objects.create(user=self.primary, partner=partner)

        with self.assertRaises(IntegrityError), transaction.atomic():
            UserPartner.objects.create(user=other_primary, partner=partner)

    def test_registration_failure_rolls_back_created_account_and_invitation(self):
        generated = self.generate_code()
        relationship = UserPartner.objects.get(user=self.primary)
        original_create = RegistrationSerializer.create

        def create_then_fail(serializer, validated_data):
            original_create(serializer, validated_data)
            raise RuntimeError("Simulated failure after account creation")

        self.client.force_authenticate(user=None)
        user_count = User.objects.count()

        with patch.object(RegistrationSerializer, "create", new=create_then_fail):
            with self.assertRaises(RuntimeError):
                self.client.post(
                    self.register_url,
                    self.partner_payload(generated.data["code"]),
                    format="json",
                )

        self.assertEqual(User.objects.count(), user_count)
        relationship.refresh_from_db()
        self.assertEqual(relationship.code, generated.data["code"])
        self.assertIsNone(relationship.partner)
