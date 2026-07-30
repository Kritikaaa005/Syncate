from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenVerifyView,
)

from users.urls import (
    auth_api_urlpatterns,
    verification_page_urlpatterns,
)


admin.site.site_header = "Syncate — Admin"
admin.site.site_title = "Syncate Admin"
admin.site.index_title = (
    "Content & Account Management"
)


urlpatterns = [
    # Django Admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Public content APIs
    path(
        "api/",
        include("articles.urls"),
    ),
    path(
        "api/",
        include("legal_docs.urls"),
    ),

    # Cycle tracking
    path(
        "api/cycle/",
        include("cycle_tracking.urls"),
    ),

    # Daily tracking
    path(
        "api/tracking/",
        include("tracking.urls"),
    ),

    # Registration
    path(
        "api/auth/",
        include("registration.urls"),
    ),

    # Login and refresh token
    path(
        "api/auth/",
        include(auth_api_urlpatterns),
    ),

    # Verify access token
    path(
        "api/auth/token/verify/",
        TokenVerifyView.as_view(),
        name="token-verify",
    ),

    # Nickname and tracking preference
    path(
        "api/users/",
        include("users.urls"),
    ),

    # Browser page opened from verification email
    path(
        "",
        include(
            verification_page_urlpatterns
        ),
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )