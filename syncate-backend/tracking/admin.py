from django.contrib import admin

from .models import DailyLog


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "log_date",
        "updated_at",
    )
    list_filter = ("log_date",)
    search_fields = (
        "user__email",
        "user__username",
    )
    ordering = ("-log_date",)