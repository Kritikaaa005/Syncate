from django.contrib import admin

from .models import (
    ContentType,
    EducationalContent,
    EducationalContentType,
)


class EducationalContentTypeInline(admin.TabularInline):
    model = EducationalContentType
    extra = 1
    autocomplete_fields = ("content_type",)
    verbose_name = "Content Type"
    verbose_name_plural = "Content Types"


@admin.register(ContentType)
class ContentTypeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    list_editable = ("is_active",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Content Type",
            {
                "fields": (
                    "name",
                    "description",
                    "is_active",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "author",
        "is_published",
        "published_date",
        "created_at",
    )

    list_filter = (
        "is_published",
        "is_deleted",
        "content_types",
        "created_at",
    )

    search_fields = (
        "title",
        "author",
        "short_description",
        "content",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_editable = (
        "is_published",
    )

    inlines = (
        EducationalContentTypeInline,
    )

    fieldsets = (
        (
            "Main Content",
            {
                "fields": (
                    "title",
                    "slug",
                    "short_description",
                    "content",
                    "author",
                )
            },
        ),
        (
            "Photo",
            {
                "fields": ("photo",)
            },
        ),
        (
            "Publishing",
            {
                "fields": (
                    "is_published",
                    "published_date",
                    "is_deleted",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )