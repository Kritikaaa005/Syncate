from django.contrib import admin

from .models import EmailVerificationToken, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        "profile_id",
        "user",
        "nickname",
        "date_of_birth",
        "is_email_verified",
        "onboarding_completed",
        "is_deleted",
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
                    "date_of_birth",
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


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Read-only in the admin — these are debugging visibility only, not
    something a staff member should ever hand-edit (e.g. manually
    flipping `used_at` would let an expired/used link work again)."""

    list_display = ("email", "user", "created_at", "expires_at", "used_at")
    list_filter = ("created_at",)
    search_fields = ("email", "user__username")
    readonly_fields = ("token", "user", "email", "created_at", "expires_at", "used_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False