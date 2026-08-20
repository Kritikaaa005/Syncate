# LOCATION: syncate-backend/cycle_tracking/serializers.py
# (replaces the existing file)
#
# Dashboard-building logic used to live here (to_representation was doing
# WAY more than a serializer should — pulling related models, running
# calculate_cycle_dashboard, building the whole payload). That's moved to
# services.build_dashboard_for_user() now. These two serializers just do
# serializer things: validate input, shape output.

from django.utils import timezone
from rest_framework import serializers

from .models import CycleProfile, PeriodLog


class PeriodLogSerializer(serializers.ModelSerializer):
    """
    Used for both listing a user's period history and logging a new
    one. start_date is the only thing that's actually required — you
    can log "my period started on X" without knowing when it'll end.
    """

    class Meta:
        model = PeriodLog
        fields = (
            "id",
            "start_date",
            "end_date",
            "date_confidence",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_start_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Start date can't be in the future.")
        return value

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "End date can't be before the start date."}
            )

        # === NEW: catch the duplicate-date case HERE, before it ever
        # reaches the database. The DB's unique constraint would still
        # block it either way (that's its job, it stays as a safety
        # net) — but without this check, a duplicate blows up as an
        # unhandled Django ValidationError deep inside .save(), which
        # DRF doesn't know how to turn into a clean 400. Checking here
        # means the person just gets a normal "you already logged
        # this" message instead of a server-crash page.
        # === CHANGED: now excludes self.instance when editing, so
        # PATCHing a period without changing its date (or nudging it
        # by a day and back) doesn't falsely flag itself as a
        # duplicate of... itself. On CREATE, self.instance is None,
        # so this behaves exactly as before.
        request = self.context.get("request")
        if request and start_date:
            duplicate_exists = (
                PeriodLog.objects.filter(user=request.user, start_date=start_date)
                .exclude(pk=self.instance.pk if self.instance else None)
                .exists()
            )

            if duplicate_exists:
                raise serializers.ValidationError(
                    {"start_date": "You've already logged a period starting on this date."}
                )

        return attrs


class CycleProfileSerializer(serializers.ModelSerializer):
    """
    Onboarding answers: cycle length + period length, each with a
    confidence flag. This is where the "idk" branching actually
    happens — if the frontend sends confidence="unknown" for a field,
    we don't trust whatever number came with it (there shouldn't be
    one, but never trust the client) and just fall back to the
    population-average default instead.
    """

    class Meta:
        model = CycleProfile
        fields = (
            "cycle_length_days",
            "cycle_length_confidence",
            "period_length_days",
            "period_length_confidence",
        )

    def _resolve_field(self, attrs, days_field, confidence_field, default_days, instance):
        """
        Shared logic for both cycle_length and period_length — same
        rule applies to each: "unknown" wins over whatever number was
        sent, everything else needs a real number in range.
        """

        current_days = getattr(instance, days_field, default_days) if instance else default_days
        current_confidence = (
            getattr(instance, confidence_field, "unknown") if instance else "unknown"
        )

        confidence = attrs.get(confidence_field, current_confidence)
        days = attrs.get(days_field, current_days)

        if confidence == CycleProfile.EstimateConfidence.UNKNOWN:
            attrs[days_field] = default_days
        elif days is None:
            raise serializers.ValidationError(
                {days_field: "A value is required unless confidence is 'unknown'."}
            )
        else:
            attrs[days_field] = days

        attrs[confidence_field] = confidence
        return attrs

    def validate(self, attrs):
        instance = self.instance

        attrs = self._resolve_field(
            attrs, "cycle_length_days", "cycle_length_confidence", 28, instance
        )
        attrs = self._resolve_field(
            attrs, "period_length_days", "period_length_confidence", 5, instance
        )

        return attrs