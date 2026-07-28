import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import legal_docs.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LegalDocument',
            fields=[
                ('document_id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('doc_type', models.CharField(choices=[('guest_terms', 'Guest — Terms & Conditions'), ('guest_privacy', 'Guest — Privacy Policy'), ('registered_terms', 'Registered User — Terms & Conditions'), ('registered_privacy', 'Registered User — Privacy Policy')], db_index=True, help_text='Which policy this is, and which audience (guest vs registered) it applies to.', max_length=32)),
                ('version', models.CharField(help_text='Numbers only, dot-separated, e.g. "1.0", "1.1", "2.0". Bump this every time you publish a change.', max_length=20, validators=[legal_docs.validators.version_format_validator])),
                ('title', models.CharField(help_text='Heading shown at the top of the document in the app.', max_length=255)),
                ('content', models.TextField(help_text='Full legal text. Supports plain text or basic Markdown — whatever the mobile team decides to render.')),
                ('effective_date', models.DateField(help_text='Date this version takes/took effect. Shown to users as "Last updated: ..." in the app.')),
                ('is_approved', models.BooleanField(default=False, help_text="Set ONLY by a superadmin (see the 'Approve selected' admin action). A version must be approved before it can be made active/live.")),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=False, help_text='Only ONE version per doc_type can be active at a time — this is what the mobile app fetches and shows. Must be an approved version. Enforced by a DB constraint, not just app logic — see the Meta.constraints below.')),
                ('is_deleted', models.BooleanField(default=False, help_text='Soft-delete flag. True = hidden from normal use and excluded from what the app can fetch. The row itself is never removed from the database.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('approved_by', models.ForeignKey(blank=True, help_text='Which superadmin approved this version (auto-set, not editable). Cleared automatically if is_approved is ever turned back off.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='legal_documents_approved', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(blank=True, help_text='Which admin created this version (auto-set, not editable).', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='legal_documents_created', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Legal Document',
                'verbose_name_plural': 'Legal Documents',
                'ordering': ['doc_type', '-effective_date', '-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='legaldocument',
            constraint=models.UniqueConstraint(
                condition=models.Q(('is_active', True)),
                fields=('doc_type',),
                name='unique_active_legal_document_per_doc_type',
            ),
        ),
    ]
