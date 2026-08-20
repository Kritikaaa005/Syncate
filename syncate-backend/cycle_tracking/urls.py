# LOCATION: syncate-backend/cycle_tracking/urls.py
# (replaces the existing file)
#
# /me/last-period/ is gone — split into routes matching the views.
# me/periods/<id>/ is NEW — lets someone edit or delete a period they
# already logged (typo'd date, forgot the end date, etc).

from django.urls import path

from .views import (
    CalendarView,
    CycleProfileView,
    DashboardView,
    PeriodLogDetailView,
    PeriodLogListCreateView,
)

app_name = "cycle_tracking"

urlpatterns = [
    path("me/periods/", PeriodLogListCreateView.as_view(), name="periods"),
    path("me/periods/<int:pk>/", PeriodLogDetailView.as_view(), name="period-detail"),
    path("me/profile/", CycleProfileView.as_view(), name="profile"),
    path("me/dashboard/", DashboardView.as_view(), name="dashboard"),
    path("me/calendar/", CalendarView.as_view(), name="calendar"),
]