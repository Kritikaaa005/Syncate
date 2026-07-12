from django.contrib import admin
from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "published_at", "created_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("title", "category", "short_description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)

    fieldsets = (
        ("Main Content", {
            "fields": ("title", "slug", "category", "short_description", "content")
        }),
        ("Image", {
            "fields": ("cover_image",)
        }),
        ("Publishing", {
            "fields": ("status", "published_at")
        }),
        ("System", {
            "fields": ("created_at", "updated_at")
        }),
    )