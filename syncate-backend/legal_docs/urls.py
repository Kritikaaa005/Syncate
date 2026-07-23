from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminLegalDocumentViewSet, LegalDocumentAcceptanceView, PublicLegalDocumentViewSet

router = DefaultRouter()
router.register(r"legal-documents", PublicLegalDocumentViewSet, basename="legal-document")
router.register(r"admin/legal-documents", AdminLegalDocumentViewSet, basename="admin-legal-document")

urlpatterns = [
    # Must come BEFORE router.urls — the router's PublicLegalDocumentViewSet
    # is registered with lookup_field='doc_type' at legal-documents/<doc_type>/,
    # which would otherwise greedily match "my-acceptances" or "accept" as
    # if they were doc_type values (Django resolves urlpatterns in order,
    # first match wins) and 404 inside the wrong view instead of ever
    # reaching these.
    path("legal-documents/my-acceptances/", LegalDocumentAcceptanceView.as_view(), name="my-legal-acceptances"),
    path("legal-documents/accept/", LegalDocumentAcceptanceView.as_view(), name="accept-legal-document"),
] + router.urls