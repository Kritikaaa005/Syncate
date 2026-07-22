from django.contrib.auth.models import User
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile


class UpdateTrackingModeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="syncate_test_user",
            email="test@syncate.com",
            password="StrongPassword123!",
        )

        self.profile, _ = UserProfile.objects.get_or_create(
            user=self.user,
        )

        self.profile.nickname = "Aadhya✨"
        self.profile.save(update_fields=["nickname"])

        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        self.url = reverse("update-tracking-mode")

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"
        )

    def test_unauthenticated_user_cannot_update_tracking_mode(self):
        response = self.client.patch(
            self.url,
            {"tracking_mode": "period"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_select_period_tracking(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {"tracking_mode": "period"},
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
            response.data["tracking_mode_label"],
            "Period Tracking",
        )

    def test_authenticated_user_can_select_pregnancy_tracking(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {"tracking_mode": "pregnancy"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.profile.refresh_from_db()

        self.assertEqual(
            self.profile.tracking_mode,
            UserProfile.TrackingMode.PREGNANCY,
        )

        self.assertEqual(
            response.data["tracking_mode_label"],
            "Pregnancy Tracking",
        )

    def test_invalid_tracking_mode_is_rejected(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {"tracking_mode": "fitness"},
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

    def test_empty_tracking_mode_is_rejected(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {"tracking_mode": ""},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_missing_tracking_mode_is_rejected(self):
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

    def test_user_can_change_tracking_mode(self):
        self.authenticate()

        first_response = self.client.patch(
            self.url,
            {"tracking_mode": "period"},
            format="json",
        )

        second_response = self.client.patch(
            self.url,
            {"tracking_mode": "pregnancy"},
            format="json",
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
            UserProfile.TrackingMode.PREGNANCY,
        )