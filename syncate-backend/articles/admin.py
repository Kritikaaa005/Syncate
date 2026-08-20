from django import forms
from django.contrib import admin

from .models import (
    ContentType,
    EducationalContent,
    EducationalContentType,
)
from .services import phase_conflict_exists


class EducationalContentAdminForm(forms.ModelForm):
    """Friendly early warning if you try to publish an article whose
    phase is already taken by another live article, instead of waiting
    for the DB's "one_published_article_per_phase" constraint to raise
    an IntegrityError on save()."""

    class Meta:
        model = EducationalContent
        fields = "__all__"

    def clean(self):
        cleaned_data = super().clean()

        phase = cleaned_data.get("phase")
        is_published = cleaned_data.get("is_published")

        if phase and is_published:
            exclude_pk = self.instance.pk if self.instance else None

            if phase_conflict_exists(phase, exclude_pk=exclude_pk):
                raise forms.ValidationError(
                    "Another published article is already assigned to "
                    "this phase. Unpublish it first, or clear this "
                    "article's phase before publishing."
                )

        return cleaned_data


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
    form = EducationalContentAdminForm

    list_display = (
        "title",
        "author",
        "phase",
        "is_published",
        "published_date",
        "created_at",
    )

    list_filter = (
        "phase",
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
                    "phase",
                    "is_published",
                    "published_date",
                    "is_deleted",
                ),
                "description": (
                    "Set 'Phase' only for the one article per cycle "
                    "phase (menstrual/follicular/ovulation/luteal) that "
                    "the app's \"Read about this phase\" button should "
                    "open. Only one PUBLISHED article can hold a given "
                    "phase at a time -- leave it blank for regular "
                    "articles."
                ),
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