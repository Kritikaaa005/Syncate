from django.utils import timezone
from rest_framework import serializers

from .models import CycleProfile
from .services import calculate_cycle_dashboard


class LastPeriodSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = CycleProfile
        fields = (
            "last_period_status",
            "last_period_start_date",
        )

    def validate(self, attrs):
        instance = self.instance

        current_status = (
            instance.last_period_status
            if instance
            else "not_provided"
        )

        current_start_date = (
            instance.last_period_start_date
            if instance
            else None
        )

        period_status = attrs.get(
            "last_period_status",
            current_status,
        )

        start_date = attrs.get(
            "last_period_start_date",
            current_start_date,
        )

        if period_status not in {
            "known",
            "unknown",
        }:
            raise serializers.ValidationError(
                {
                    "last_period_status": (
                        "Status must be known "
                        "or unknown."
                    )
                }
            )

        if period_status == "known":
            if not start_date:
                raise serializers.ValidationError(
                    {
                        "last_period_start_date": (
                            "A period start date "
                            "is required when the "
                            "status is known."
                        )
                    }
                )

            if start_date > timezone.localdate():
                raise serializers.ValidationError(
                    {
                        "last_period_start_date": (
                            "The period start date "
                            "cannot be in the future."
                        )
                    }
                )

        if period_status == "unknown":
            attrs[
                "last_period_start_date"
            ] = None

        return attrs

    def to_representation(
        self,
        instance,
    ):
        data = super().to_representation(
            instance
        )

        user_profile = getattr(
            instance.user,
            "profile",
            None,
        )

        saved_nickname = getattr(
            user_profile,
            "nickname",
            "",
        )

        data.update(
            {
                "nickname": (
                    saved_nickname.strip()
                    if (
                        isinstance(
                            saved_nickname,
                            str,
                        )
                        and saved_nickname.strip()
                    )
                    else "there"
                ),
                "dashboard_state": "unknown",
                "cycle_day": None,
                "cycle_length": None,
                "phase": None,
                "current_cycle_start_date": None,
                "next_period_date": None,
                "estimated_ovulation_date": None,
                "days_until_next_period": None,
                "days_until_ovulation": None,
                "prediction_basis": None,
            }
        )

        if (
            instance.last_period_status
            != "known"
            or not instance
            .last_period_start_date
        ):
            return data

        dashboard = (
            calculate_cycle_dashboard(
                instance
                .last_period_start_date
            )
        )

        data.update(
            {
                "dashboard_state": "known",
                "cycle_day": dashboard[
                    "cycle_day"
                ],
                "cycle_length": dashboard[
                    "cycle_length"
                ],
                "phase": dashboard[
                    "phase"
                ],
                "current_cycle_start_date": (
                    dashboard[
                        "current_cycle_start_date"
                    ].isoformat()
                ),
                "next_period_date": (
                    dashboard[
                        "next_period_date"
                    ].isoformat()
                ),
                "estimated_ovulation_date": (
                    dashboard[
                        "estimated_ovulation_date"
                    ].isoformat()
                ),
                "days_until_next_period": (
                    dashboard[
                        "days_until_next_period"
                    ]
                ),
                "days_until_ovulation": (
                    dashboard[
                        "days_until_ovulation"
                    ]
                ),
                "prediction_basis": (
                    dashboard[
                        "prediction_basis"
                    ]
                ),
            }
        )

        return data