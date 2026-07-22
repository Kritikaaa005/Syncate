"""
legal_docs/views.py

This file is the fix for issue #6 ("no way for the app to actually fetch
the documents yet") — LegalDocument.get_active() was already sitting
ready in models.py, but nothing wired it up to an actual HTTP endpoint.
Now there is one.

Two viewsets, same split reasoning as serializers.py:

- PublicLegalDocumentViewSet: what the mobile app calls. Read-only,
  AllowAny (a guest, by definition, isn't logged in — they still need to
  be able to read the guest Terms & Conditions before agreeing to them).
  Only ever returns ACTIVE, non-deleted documents — a draft or an
  unapproved version should never be visible outside the admin panel.

- AdminLegalDocumentViewSet: full CRUD for the dashboard, IsAdminUser
  only. Approve / activate / soft-delete are custom @action endpoints
  rather than writable serializer fields — same pattern as
  articles/views.py's publish/unpublish — so each one can enforce its
  own rule (only a superuser can approve; only an approved doc can
  activate; delete never actually deletes) in one obvious place instead
  of being smuggled through a generic PATCH.
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import LegalDocument
from .serializers import AdminLegalDocumentSerializer, PublicLegalDocumentSerializer


class PublicLegalDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public endpoint the mobile app calls, e.g.:
        GET /api/legal-documents/                -> all 4 currently-live docs
        GET /api/legal-documents/?doc_type=guest_terms
        GET /api/legal-documents/guest_terms/     -> just that one (lookup by doc_type)
    """

    serializer_class = PublicLegalDocumentSerializer
    permission_classes = [AllowAny]
    lookup_field = 'doc_type'

    def get_queryset(self):
        queryset = LegalDocument.objects.filter(is_active=True)

        doc_type = self.request.query_params.get('doc_type')
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)

        return queryset.order_by('doc_type')


class AdminLegalDocumentViewSet(viewsets.ModelViewSet):
    """
    Superuser/staff CRUD endpoint for legal documents. Mirrors the
    draft -> approve -> activate workflow from admin.py, just over HTTP
    instead of the Django admin UI (handy for anyone building a nicer
    custom dashboard on top of this later).
    """

    serializer_class = AdminLegalDocumentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # all_objects (not objects) so admins can still see soft-deleted
        # rows in the dashboard — same reasoning as admin.py's
        # get_queryset override.
        return LegalDocument.all_objects.all().order_by('doc_type', '-effective_date')

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Only a superuser can approve — regular staff get a 403. Once
        approved, the doc becomes eligible to be made active."""
        if not request.user.is_superuser:
            return Response(
                {'detail': "Only a superadmin can approve legal documents."},
                status=status.HTTP_403_FORBIDDEN,
            )

        from django.utils import timezone

        legal_document = self.get_object()
        legal_document.is_approved = True
        legal_document.approved_by = request.user
        legal_document.approved_at = timezone.now()
        legal_document.save(update_fields=['is_approved', 'approved_by', 'approved_at', 'updated_at'])

        return Response(self.get_serializer(legal_document).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def unapprove(self, request, pk=None):
        """Reverses approval. Also un-publishes it if it happened to be
        live — an unapproved doc can't stay active (models.py enforces
        this too, but we handle it tidily here rather than raising)."""
        legal_document = self.get_object()
        legal_document.is_approved = False
        legal_document.is_active = False
        # approved_by / approved_at get cleared automatically inside
        # save() — see models.py fix for issue #9.
        legal_document.save(update_fields=['is_approved', 'is_active', 'approved_by', 'approved_at', 'updated_at'])

        return Response(self.get_serializer(legal_document).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Makes this the live version for its doc_type. Fails with a 400
        (not a crash) if the doc isn't approved yet."""
        legal_document = self.get_object()

        try:
            legal_document.activate()
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.get_serializer(legal_document).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Overridden so DELETE never actually deletes — same idea as
        articles/views.py's destroy() override, just soft-deleting
        instead of hard-deleting. (LegalDocument.delete() would raise
        PermissionError anyway if we didn't override this — see
        models.py — but overriding here gives a clean 200 + message
        instead of a 500.)"""
        legal_document = self.get_object()
        legal_document.soft_delete()

        return Response(
            {'message': 'Legal document soft-deleted successfully.'},
            status=status.HTTP_200_OK,
        )
