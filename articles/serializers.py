from rest_framework import serializers

from .models import ContentType, EducationalContent


class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = [
            "content_type_id",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "content_type_id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        name = value.strip()

        if not name:
            raise serializers.ValidationError(
                "Content type name cannot be empty."
            )

        queryset = ContentType.objects.filter(name__iexact=name)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "A content type with this name already exists."
            )

        return name


class EducationalContentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(
        source="content_id",
        read_only=True,
    )

    content_types = ContentTypeSerializer(
        many=True,
        read_only=True,
    )

    content_type_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=ContentType.objects.filter(is_active=True),
        source="content_types",
        required=True,
    )

    photo_url = serializers.SerializerMethodField()

    # Temporary compatibility field for the current mobile frontend.
    cover_image_url = serializers.SerializerMethodField()

    # Temporary compatibility field using the first assigned type.
    category = serializers.SerializerMethodField()

    class Meta:
        model = EducationalContent
        fields = [
            "id",
            "content_id",
            "title",
            "slug",
            "short_description",
            "content",
            "author",
            "photo",
            "photo_url",
            "cover_image_url",
            "content_types",
            "content_type_ids",
            "category",
            "published_date",
            "is_published",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "content_id",
            "slug",
            "photo_url",
            "cover_image_url",
            "content_types",
            "category",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        title = value.strip()

        if not title:
            raise serializers.ValidationError(
                "Title cannot be empty."
            )

        return title

    def validate_author(self, value):
        author = value.strip()

        if not author:
            raise serializers.ValidationError(
                "Author cannot be empty."
            )

        return author

    def validate_short_description(self, value):
        description = value.strip()

        if not description:
            raise serializers.ValidationError(
                "Short description cannot be empty."
            )

        return description

    def validate_content(self, value):
        content = value.strip()

        if not content:
            raise serializers.ValidationError(
                "Content cannot be empty."
            )

        return content

    def validate_content_type_ids(self, value):
        if not value:
            raise serializers.ValidationError(
                "At least one content type must be selected."
            )

        return value

    def create(self, validated_data):
        content_types = validated_data.pop("content_types", [])

        educational_content = EducationalContent.objects.create(
            **validated_data
        )

        educational_content.content_types.set(content_types)

        return educational_content

    def update(self, instance, validated_data):
        content_types = validated_data.pop("content_types", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if content_types is not None:
            instance.content_types.set(content_types)

        return instance

    def get_photo_url(self, obj):
        request = self.context.get("request")

        if not obj.photo:
            return None

        if request:
            return request.build_absolute_uri(obj.photo.url)

        return obj.photo.url

    def get_cover_image_url(self, obj):
        return self.get_photo_url(obj)

    def get_category(self, obj):
        first_content_type = obj.content_types.first()

        if first_content_type:
            return first_content_type.name

        return None