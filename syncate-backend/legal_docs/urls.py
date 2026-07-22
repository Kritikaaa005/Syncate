from rest_framework.routers import DefaultRouter

from .views import AdminLegalDocumentViewSet, PublicLegalDocumentViewSet

router = DefaultRouter()
router.register(r"legal-documents", PublicLegalDocumentViewSet, basename="legal-document")
router.register(r"admin/legal-documents", AdminLegalDocumentViewSet, basename="admin-legal-document")

urlpatterns = router.urls