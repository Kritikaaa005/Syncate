# LOCATION: syncate-backend/cycle_tracking/views.py
# (replaces the existing file)
#
# Old LastPeriodView did onboarding-answer saving AND dashboard building
# in one view. Split into three, each with one job:
#   - PeriodLogListCreateView: log a period / see period history
#   - CycleProfileView: onboarding answers (cycle length, period length)
#   - DashboardView: read-only, "what does my dashboard look like right now"

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import UserProfile

from . import services
from .models import CycleProfile, PeriodLog
from .serializers import CycleProfileSerializer, PeriodLogSerializer


class PeriodLogListCreateView(APIView):
    """
    GET  /api/cycle/me/periods/   -> full period history, newest first
    POST /api/cycle/me/periods/   -> log a new period
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        logs = PeriodLog.objects.filter(user=request.user)
        serializer = PeriodLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # === CHANGED: context={"request": request} added — the
        # serializer's validate() needs request.user to check for a
        # duplicate start_date before it hits the DB. Without this,
        # self.context.get("request") would be None and that check
        # silently skips — the DB constraint would still catch it, but
        # back to the ugly 500 we just fixed.
        serializer = PeriodLogSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)

        # First time this user has ever logged anything -> onboarding's
        # done as far as cycle tracking goes. (Doesn't touch the
        # cycle-length/period-length questions, those are their own
        # step via CycleProfileView.)
        profile_updated = UserProfile.objects.filter(user=request.user).update(
            onboarding_completed=True,
            updated_at=timezone.now(),
        )

        return Response(
            {
                **serializer.data,
                "onboarding_completed": profile_updated > 0,
                "message": "Period logged successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class PeriodLogDetailView(APIView):
    """
    GET    /api/cycle/me/periods/<id>/   -> a single logged period
    PATCH  /api/cycle/me/periods/<id>/   -> fix a wrong date, add an end date, etc.
    DELETE /api/cycle/me/periods/<id>/   -> remove a mis-logged entry

    People WILL mistype a date or want to add the end date a few days
    later — this is the "let them fix it" endpoint. get_object below
    always filters by user=request.user first, so there's no way to
    fetch or edit someone else's period log by guessing an id (the
    exact BOLA mistake the audit was checking for elsewhere).
    """

    permission_classes = [IsAuthenticated]

    @staticmethod
    def get_object(user, pk):
        return get_object_or_404(PeriodLog, pk=pk, user=user)

    def get(self, request, pk, *args, **kwargs):
        period_log = self.get_object(request.user, pk)
        serializer = PeriodLogSerializer(period_log)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        period_log = self.get_object(request.user, pk)
        serializer = PeriodLogSerializer(
            period_log,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs):
        period_log = self.get_object(request.user, pk)
        period_log.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CycleProfileView(APIView):
    """
    GET   /api/cycle/me/profile/  -> current cycle-length / period-length answers
    PATCH /api/cycle/me/profile/  -> update them (handles "idk" via confidence field)
    """

    permission_classes = [IsAuthenticated]

    @staticmethod
    def get_cycle_profile(user):
        cycle_profile, _ = CycleProfile.objects.get_or_create(user=user)
        return cycle_profile

    def get(self, request, *args, **kwargs):
        cycle_profile = self.get_cycle_profile(request.user)
        serializer = CycleProfileSerializer(cycle_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        cycle_profile = self.get_cycle_profile(request.user)
        serializer = CycleProfileSerializer(cycle_profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class DashboardView(APIView):
    """
    GET /api/cycle/me/dashboard/  -> everything the home screen needs:
    cycle day, phase, predictions, or "awaiting_first_period" if there's
    no PeriodLog yet. All the actual logic lives in services.py.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        dashboard = services.build_dashboard_for_user(request.user)

        user_profile = getattr(request.user, "profile", None)
        saved_nickname = getattr(user_profile, "nickname", "")

        dashboard["nickname"] = (
            saved_nickname.strip()
            if isinstance(saved_nickname, str) and saved_nickname.strip()
            else "there"
        )

        return Response(dashboard, status=status.HTTP_200_OK)


class CalendarView(APIView):
    """
    GET /api/cycle/me/calendar/?year=2026  -> every day of that year,
    labeled with a phase. Defaults to the current year if ?year isn't
    given. All the actual per-day math lives in
    services.build_calendar_for_user() — this view just parses/
    validates the year query param and hands off.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        year_param = request.query_params.get("year")

        if year_param is None:
            year = timezone.localdate().year
        else:
            try:
                year = int(year_param)
            except (TypeError, ValueError):
                return Response(
                    {"year": "Must be a valid year, e.g. 2026."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Sanity bound, not a real business rule — just stops
        # date(year, 1, 1) from throwing on something absurd like
        # year=99999999999 and turning into an unhandled 500.
        if year < 1900 or year > 2100:
            return Response(
                {"year": "Year must be between 1900 and 2100."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calendar_data = services.build_calendar_for_user(request.user, year)
        return Response(calendar_data, status=status.HTTP_200_OK)