from datetime import datetime

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DailyLog
from .serializers import (
    DailyLogSerializer,
    DailyLogRangeQuerySerializer,
)


class DailyLogRangeView(APIView):
    """
    List the authenticated user's logs within a
    date range (used for calendar markers/dots).

    GET /api/tracking/me/logs/?start=YYYY-MM-DD&end=YYYY-MM-DD
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(
        self,
        request,
        *args,
        **kwargs,
    ):
        query_serializer = (
            DailyLogRangeQuerySerializer(
                data=request.query_params,
            )
        )

        query_serializer.is_valid(
            raise_exception=True
        )

        start_date = query_serializer.validated_data[
            "start"
        ]

        end_date = query_serializer.validated_data[
            "end"
        ]

        logs = DailyLog.objects.filter(
            user=request.user,
            log_date__gte=start_date,
            log_date__lte=end_date,
        )

        serializer = DailyLogSerializer(
            logs,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class DailyLogDetailView(APIView):
    """
    Read or upsert the authenticated user's log
    for a single date.

    GET /api/tracking/me/logs/<log_date>/
    PUT /api/tracking/me/logs/<log_date>/
    """

    permission_classes = [
        IsAuthenticated,
    ]

    @staticmethod
    def parse_log_date(log_date):
        try:
            return datetime.strptime(
                log_date,
                "%Y-%m-%d",
            ).date()
        except ValueError:
            return None

    def get(
        self,
        request,
        log_date,
        *args,
        **kwargs,
    ):
        parsed_date = self.parse_log_date(
            log_date
        )

        if parsed_date is None:
            return Response(
                {
                    "log_date": (
                        "Use the format "
                        "YYYY-MM-DD."
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        log = DailyLog.objects.filter(
            user=request.user,
            log_date=parsed_date,
        ).first()

        if log is None:
            return Response(
                {
                    "log_date": (
                        parsed_date.isoformat()
                    ),
                    "data": {},
                    "created_at": None,
                    "updated_at": None,
                },
                status=status.HTTP_200_OK,
            )

        serializer = DailyLogSerializer(log)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def put(
        self,
        request,
        log_date,
        *args,
        **kwargs,
    ):
        parsed_date = self.parse_log_date(
            log_date
        )

        if parsed_date is None:
            return Response(
                {
                    "log_date": (
                        "Use the format "
                        "YYYY-MM-DD."
                    ),
                },
                status=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        log, _ = (
            DailyLog.objects.get_or_create(
                user=request.user,
                log_date=parsed_date,
            )
        )

        payload = {
            "log_date": parsed_date,
            "data": request.data.get(
                "data",
                {},
            ),
        }

        serializer = DailyLogSerializer(
            log,
            data=payload,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                **serializer.data,
                "message": (
                    "Daily log saved "
                    "successfully."
                ),
            },
            status=status.HTTP_200_OK,
        )