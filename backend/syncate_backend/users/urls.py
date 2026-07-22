from django.urls import path

from .views import (
    UpdateNicknameView,
    UpdateTrackingModeView,
)

urlpatterns = [
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