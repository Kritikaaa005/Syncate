from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class ContentType(models.Model):
    content_type_id = models.BigAutoField(primary_key=True)

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    description = models.CharField(
        max_length=300,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Content Type"
        verbose_name_plural = "Content Types"

    def __str__(self):
        return self.name


class EducationalContent(models.Model):
    content_id = models.BigAutoField(primary_key=True)

    title = models.CharField(max_length=200)

    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True,
    )

    # Needed for the educational-content cards in the mobile app.
    short_description = models.CharField(
        max_length=300,
    )

    content = models.TextField()

    # Kept as text for now, e.g. "Syncate Team" or "Dr. Maya Sharma".
    author = models.CharField(max_length=150)

    photo = models.ImageField(
        upload_to="educational_content/%Y/%m/",
        blank=True,
        null=True,
    )

    published_date = models.DateTimeField(
        blank=True,
        null=True,
    )

    is_published = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    content_types = models.ManyToManyField(
        ContentType,
        through="EducationalContentType",
        related_name="educational_contents",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = [ "-published_date", "-created_at"]
        verbose_name = "Educational Content"
        verbose_name_plural = "Educational Content"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()

        if self.is_published and self.published_date is None:
            self.published_date = timezone.now()

        super().save(*args, **kwargs)

    def _generate_unique_slug(self):
        base_slug = slugify(self.title) or "educational-content"
        slug = base_slug
        counter = 1

        while EducationalContent.objects.filter(slug=slug).exclude(
            pk=self.pk
        ).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    def __str__(self):
        return self.title


class EducationalContentType(models.Model):
    id = models.BigAutoField(primary_key=True)

    content = models.ForeignKey(
        EducationalContent,
        on_delete=models.CASCADE,
        related_name="content_type_links",
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
        related_name="content_links",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["content", "content_type"],
                name="unique_educational_content_type",
            )
        ]

        verbose_name = "Educational Content Type"
        verbose_name_plural = "Educational Content Types"

    def __str__(self):
        return f"{self.content.title} — {self.content_type.name}"