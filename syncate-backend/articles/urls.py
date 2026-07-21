from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminArticleViewSet,
    AdminContentTypeViewSet,
    PublicArticleViewSet,
)

router = DefaultRouter()

# Public APIs
router.register(
    r"articles",
    PublicArticleViewSet,
    basename="articles",
)

# Admin Educational Content
router.register(
    r"admin/articles",
    AdminArticleViewSet,
    basename="admin-articles",
)

# Admin Content Types
router.register(
    r"admin/content-types",
    AdminContentTypeViewSet,
    basename="admin-content-types",
)

urlpatterns = [
    path("", include(router.urls)),
]