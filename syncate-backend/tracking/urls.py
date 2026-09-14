from django.urls import path

from .views import (
    DailyLogRangeView,
    DailyLogDetailView,
)


app_name = "tracking"


urlpatterns = [
    path(
        "me/logs/",
        DailyLogRangeView.as_view(),
        name="log-range",
    ),
    path(
        "me/logs/<str:log_date>/",
        DailyLogDetailView.as_view(),
        name="log-detail",
    ),
]