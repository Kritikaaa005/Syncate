from django.urls import path

from .views import UpdateNicknameView

urlpatterns = [
    path(
        "me/nickname/",
        UpdateNicknameView.as_view(),
        name="update-nickname",
    ),
]