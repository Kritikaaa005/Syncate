from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .models import ContentType, EducationalContent
from .serializers import (
    ContentTypeSerializer,
    EducationalContentSerializer,
)


class PublicArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public endpoint for guest and registered users.

    Only returns educational content that is:
    - published
    - not soft-deleted
    """

    serializer_class = EducationalContentSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            EducationalContent.objects.filter(
                is_published=True,
                is_deleted=False,
            )
            .prefetch_related("content_types")
            .order_by( "-published_date", "-created_at")
        )


class AdminArticleViewSet(viewsets.ModelViewSet):
    """
    Superuser/staff CRUD endpoint for educational content.
    """

    serializer_class = EducationalContentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return (
            EducationalContent.objects.filter(is_deleted=False)
            .prefetch_related("content_types")
            .order_by("-created_at")
        )

    @action(detail=True, methods=["patch"])
    def publish(self, request, pk=None):
        educational_content = self.get_object()

        educational_content.is_published = True

        if educational_content.published_date is None:
            educational_content.published_date = timezone.now()

        educational_content.save(
            update_fields=[
                "is_published",
                "published_date",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(educational_content).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"])
    def unpublish(self, request, pk=None):
        educational_content = self.get_object()

        educational_content.is_published = False
        educational_content.published_date = None

        educational_content.save(
            update_fields=[
                "is_published",
                "published_date",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(educational_content).data,
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        educational_content = self.get_object()

        educational_content.is_deleted = True
        educational_content.is_published = False
        educational_content.save(
            update_fields=[
                "is_deleted",
                "is_published",
                "updated_at",
            ]
        )

        return Response(
            {"message": "Educational content deleted successfully."},
            status=status.HTTP_200_OK,
        )


class AdminContentTypeViewSet(viewsets.ModelViewSet):
    """
    Superuser/staff CRUD endpoint for content types.
    """

    serializer_class = ContentTypeSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return ContentType.objects.all().order_by("name")

    def destroy(self, request, *args, **kwargs):
        content_type = self.get_object()

        if content_type.content_links.exists():
            content_type.is_active = False
            content_type.save(
                update_fields=[
                    "is_active",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "message": (
                        "Content type is already assigned to educational "
                        "content, so it was deactivated instead of deleted."
                    )
                },
                status=status.HTTP_200_OK,
            )

        content_type.delete()

        return Response(
            {"message": "Content type deleted successfully."},
            status=status.HTTP_200_OK,
        )