from django.utils import timezone
from rest_framework import serializers

from .models import DailyLog


class DailyLogSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = DailyLog
        fields = (
            "log_date",
            "data",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "created_at",
            "updated_at",
        )

    def validate_log_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError(
                "The log date cannot be in "
                "the future."
            )

        return value

    def validate_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Log data must be a JSON "
                "object."
            )

        return value


class DailyLogRangeQuerySerializer(
    serializers.Serializer
):
    """
    Validates the query params for fetching a
    range of logs, e.g.

    GET /api/tracking/me/logs/?start=2026-08-01&end=2026-08-31
    """

    start = serializers.DateField()
    end = serializers.DateField()

    def validate(self, attrs):
        if attrs["start"] > attrs["end"]:
            raise serializers.ValidationError(
                {
                    "start": (
                        "start date must be on "
                        "or before end date."
                    ),
                }
            )

        return attrs