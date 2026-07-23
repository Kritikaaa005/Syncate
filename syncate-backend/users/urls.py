"""
users/urls.py

Two different kinds of route, deliberately not prefixed the same way:

- /verify-email/<token>/  — a plain web page (see views.py), NOT under
  /api/ — it's meant to be opened directly in a phone's browser from the
  email, not called by the app as JSON.
- /api/auth/login/ and /api/auth/token/refresh/ — the actual DRF/JWT API
  surface the mobile app calls.

Wired into config/urls.py as two separate includes so the non-/api/ path
is obvious at the project level, not buried.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, VerifyEmailConfirmView

# Included at the project root (no /api/ prefix) — see config/urls.py.
verification_page_urlpatterns = [
    path("verify-email/<str:token>/", VerifyEmailConfirmView.as_view(), name="verify-email"),
]

# Included under /api/auth/ — see config/urls.py.
auth_api_urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
