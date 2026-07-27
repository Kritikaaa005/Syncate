from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import UserProfile

from .models import CycleProfile
from .serializers import LastPeriodSerializer


class LastPeriodView(APIView):
    """
    Read or update the authenticated user's
    last-period information.

    GET /api/cycle/me/last-period/
    PATCH /api/cycle/me/last-period/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    @staticmethod
    def get_cycle_profile(user):
        cycle_profile, _ = (
            CycleProfile.objects.get_or_create(
                user=user,
            )
        )

        return cycle_profile

    def get(
        self,
        request,
        *args,
        **kwargs,
    ):
        cycle_profile = (
            self.get_cycle_profile(
                request.user
            )
        )

        serializer = LastPeriodSerializer(
            cycle_profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def patch(
        self,
        request,
        *args,
        **kwargs,
    ):
        cycle_profile = (
            self.get_cycle_profile(
                request.user
            )
        )

        serializer = LastPeriodSerializer(
            cycle_profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

     
        profile_updated = (
            UserProfile.objects.filter(
                user=request.user,
            ).update(
                onboarding_completed=True,
                updated_at=timezone.now(),
            )
        )

        onboarding_completed = (
            profile_updated > 0
        )

        return Response(
            {
                **serializer.data,
                "onboarding_completed": (
                    onboarding_completed
                ),
                "message": (
                    "Last-period information saved "
                    "successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )