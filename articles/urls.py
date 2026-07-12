from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicArticleViewSet, AdminArticleViewSet

router = DefaultRouter()
router.register(r"articles", PublicArticleViewSet, basename="public-articles")
router.register(r"admin/articles", AdminArticleViewSet, basename="admin-articles")

urlpatterns = [
    path("", include(router.urls)),
]