from django.contrib import admin

from .models import CycleProfile


@admin.register(CycleProfile)
class CycleProfileAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user",
        "last_period_start_date",
        "last_period_status",
        "created_at",
        "updated_at",
    ]

    list_filter = [
        "last_period_status",
        "created_at",
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