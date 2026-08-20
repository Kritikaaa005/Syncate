# LOCATION: syncate-backend/cycle_tracking/admin.py
# (replaces the existing file)

from django.contrib import admin

from .models import CycleProfile, PeriodLog


@admin.register(CycleProfile)
class CycleProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "cycle_length_days",
        "cycle_length_confidence",
        "period_length_days",
        "period_length_confidence",
        "updated_at",
    ]

    list_filter = [
        "cycle_length_confidence",
        "period_length_confidence",
    ]

    search_fields = [
        "user__username",
        "user__email",
        "user__profile__nickname",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]


@admin.register(PeriodLog)
class PeriodLogAdmin(admin.ModelAdmin):
    # This is the one worth eyeballing in admin when someone reports a
    # weird prediction — you can see their whole logged history here.
    list_display = [
        "id",
        "user",
        "start_date",
        "end_date",
        "date_confidence",
        "created_at",
    ]

    list_filter = [
        "date_confidence",
    ]

    search_fields = [
        "user__username",
        "user__email",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]