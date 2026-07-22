from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        "profile_id",
        "user",
        "nickname",
        "is_email_verified",
        "onboarding_completed",
        "created_at",
    )

    list_filter = (
        "is_email_verified",
        "onboarding_completed",
        "is_deleted",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "nickname",
    )

    readonly_fields = (
        "profile_id",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "User Information",
            {
                "fields": (
                    "user",
                    "nickname",
                    "age",
                )
            },
        ),
        (
            "Account Status",
            {
                "fields": (
                    "is_email_verified",
                    "onboarding_completed",
                    "is_deleted",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "profile_id",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )