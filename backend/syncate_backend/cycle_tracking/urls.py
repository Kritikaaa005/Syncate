from django.urls import path

from .views import LastPeriodView


app_name = "cycle_tracking"


urlpatterns = [
    path(
        "me/last-period/",
        LastPeriodView.as_view(),
        name="last-period",
    ),
]