"""
URL routes owned by the users app.

This module exposes three separate route groups:

1. `urlpatterns`
   Included under `/api/users/` for authenticated profile operations.

2. `auth_api_urlpatterns`
   Included under `/api/auth/` for login and JWT refresh.

3. `verification_page_urlpatterns`
   Included at the project root because verification links open directly
   in the user's browser.
"""

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import (
    AddEmailView,
    LoginView,
    MyProfileView,
    UpdateNicknameView,
    UpdateTrackingModeView,
    VerifyEmailConfirmView,
)


# Included under /api/users/
urlpatterns = [
    path(
        "me/profile/",
        MyProfileView.as_view(),
        name="my-profile",
    ),
    path(
        "me/email/",
        AddEmailView.as_view(),
        name="add-email",
    ),
    path(
        "me/nickname/",
        UpdateNicknameView.as_view(),
        name="update-nickname",
    ),
    path(
        "me/tracking-mode/",
        UpdateTrackingModeView.as_view(),
        name="update-tracking-mode",
    ),
]


# Included under /api/auth/
auth_api_urlpatterns = [
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
]


# Included at the project root without an /api/ prefix.
verification_page_urlpatterns = [
    path(
        "verify-email/<str:token>/",
        VerifyEmailConfirmView.as_view(),
        name="verify-email",
    ),
]
