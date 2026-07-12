from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Article
from .serializers import ArticleSerializer


class PublicArticleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Article.objects.filter(status="published", is_deleted=False).order_by("-published_at")


class AdminArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Article.objects.filter(is_deleted=False).order_by("-created_at")

    @action(detail=True, methods=["patch"])
    def publish(self, request, pk=None):
        article = self.get_object()
        article.status = "published"
        article.published_at = timezone.now()
        article.save()
        return Response(self.get_serializer(article).data)

    @action(detail=True, methods=["patch"])
    def unpublish(self, request, pk=None):
        article = self.get_object()
        article.status = "draft"
        article.published_at = None
        article.save()
        return Response(self.get_serializer(article).data)

    def destroy(self, request, *args, **kwargs):
        article = self.get_object()
        article.is_deleted = True
        article.save()
        return Response({"message": "Article deleted successfully"})