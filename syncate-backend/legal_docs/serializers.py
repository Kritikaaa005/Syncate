"""
legal_docs/serializers.py

Two separate serializers on purpose (SRP): the mobile app and the admin
dashboard need very different shapes of the same model.

- PublicLegalDocumentSerializer: what the mobile app gets when it asks
  "give me the current Terms & Conditions for a guest". Read-only, and
  deliberately leaves out internal fields (who approved it, is_deleted,
  created_by...) — none of that is the app's business.

- AdminLegalDocumentSerializer: what the admin CRUD screens use. Exposes
  everything, but keeps the workflow fields (is_approved, approved_by,
  approved_at, is_active, is_deleted, created_by) read-only here — those
  only change via the dedicated admin actions (approve / activate /
  soft-delete in views.py), never via a raw PATCH to the field. This is
  the same "approve/publish/unpublish are actions, not writable fields"
  pattern already used in articles/views.py.
"""
from rest_framework import serializers

from .models import LegalDocument


class PublicLegalDocumentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='document_id', read_only=True)

    class Meta:
        model = LegalDocument
        fields = [
            'id',
            'doc_type',
            'version',
            'title',
            'content',
            'effective_date',
            'updated_at',
        ]
        read_only_fields = fields  # the public endpoint is read-only, full stop


class AdminLegalDocumentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='document_id', read_only=True)

    class Meta:
        model = LegalDocument
        fields = [
            'id',
            'doc_type',
            'version',
            'title',
            'content',
            'effective_date',
            'is_approved',
            'approved_by',
            'approved_at',
            'is_active',
            'is_deleted',
            'created_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'is_approved',
            'approved_by',
            'approved_at',
            'is_active',
            'is_deleted',
            'created_by',
            'created_at',
            'updated_at',
        ]

    def validate_version(self, value):
        # The model field already has version_format_validator attached,
        # but DRF doesn't automatically run Django field validators for
        # CharField the way it does for e.g. EmailField — so we call
        # full_clean-style validation explicitly here too. Belt and
        # braces: this catches bad input at the API layer with a clean
        # 400, before it ever reaches model.save()'s full_clean() (which
        # would raise a less REST-friendly ValidationError/ValueError).
        from .validators import version_format_validator
        version_format_validator(value)
        return value

    def validate_title(self, value):
        title = value.strip()
        if not title:
            raise serializers.ValidationError("Title cannot be empty.")
        return title

    def validate_content(self, value):
        content = value.strip()
        if not content:
            raise serializers.ValidationError("Content cannot be empty.")
        return content

    def create(self, validated_data):
        request = self.context.get('request')
        if request is not None:
            validated_data['created_by'] = request.user
        return LegalDocument.objects.create(**validated_data)
