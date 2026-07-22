from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

# Cosmetic branding for the admin panel header/title/index page — just
# text, so it's obvious at a glance which project's /admin/ you're in.
# Doesn't affect behavior or permissions, purely for the humans logging in.
admin.site.site_header = "Syncate — Admin"
admin.site.site_title = "Syncate Admin"
admin.site.index_title = "Content & Account Management"

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API
    path("api/", include("articles.urls")),
    path("api/", include("legal_docs.urls")),
]

# Serve uploaded media during development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )