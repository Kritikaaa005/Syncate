"""
legal_docs/admin.py

Django-admin CRUD interface for Terms & Conditions / Privacy Policy
content — this is the actual "superadmin can do CRUD on legal docs"
screen.

Important mindset shift from the old version: this file used to be where
several rules were *enforced*. They're not anymore — they're enforced in
models.py / managers.py (DB constraint, blocked delete(), auto-cleared
approval metadata). This file is now just a friendly UI on top of that:
it still stops people doing silly things early (so they get a nice admin
error instead of a raw exception), but if it were deleted entirely, the
underlying rules would still hold for any other code path. That's the
whole point of fixing this at the model layer instead of only here.
"""
from django import forms
from django.contrib import admin
from django.utils.html import format_html

from .models import LegalDocument


class LegalDocumentAdminForm(forms.ModelForm):
    """Friendly early warning if you try to activate an unapproved doc,
    instead of waiting for models.py to raise ValueError on save()."""

    class Meta:
        model = LegalDocument
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('is_active') and not cleaned_data.get('is_approved'):
            raise forms.ValidationError(
                "Can't activate this version until it's approved. "
                "Tick 'Is approved' first, then use the 'Activate selected' action."
            )
        return cleaned_data


@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    form = LegalDocumentAdminForm

    def get_queryset(self, request):
        # all_objects (not the default `objects`) so admins can still
        # find/restore something they soft-deleted by mistake.
        return LegalDocument.all_objects.all()

    # --- LIST VIEW ---
    list_display = (
        'title',
        'doc_type',
        'version',
        'status_badge',
        'effective_date',
        'created_by',
        'updated_at',
    )
    list_filter = ('doc_type', 'is_approved', 'is_active', 'is_deleted')
    search_fields = ('title', 'content', 'version')
    ordering = ('doc_type', '-effective_date')
    actions = ['approve_selected', 'activate_selected', 'soft_delete_selected']

    # --- DETAIL / EDIT VIEW ---
    fieldsets = (
        ('Document Info', {
            'fields': ('doc_type', 'title', 'version', 'effective_date')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Approval (superadmin only)', {
            'fields': ('is_approved', 'approved_by', 'approved_at'),
            'description': (
                "A version must be approved before it can be made active/live. "
                "Only superadmins can approve — use the 'Approve selected' "
                "action in the list view rather than editing this checkbox "
                "directly, so approved_by/approved_at get stamped correctly."
            ),
        }),
        ('Publishing', {
            'fields': ('is_active',),
            'description': (
                "Read-only here on purpose — use the 'Activate selected' action "
                "instead of ticking this box directly. The action runs inside a "
                "single database transaction, which is what actually guarantees "
                "only one version per doc_type ends up live (see models.py)."
            ),
        }),
        ('Metadata (read-only)', {
            'fields': ('is_deleted', 'created_by', 'created_at', 'updated_at'),
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = [
            'created_by', 'created_at', 'updated_at', 'is_deleted',
            'approved_by', 'approved_at', 'is_active',
        ]
        # Only superusers may ever touch is_approved directly in the form;
        # everyone else gets it as read-only (use the admin action instead,
        # or just don't approve your own drafts).
        if not request.user.is_superuser:
            readonly.append('is_approved')
        return readonly

    def status_badge(self, obj):
        if obj.is_deleted:
            color, bg, label = '#fff', '#b71c1c', 'DELETED'
        elif obj.is_active:
            color, bg, label = '#fff', '#2e7d32', 'LIVE'
        elif obj.is_approved:
            color, bg, label = '#fff', '#1565c0', 'approved'
        else:
            color, bg, label = '#555', '#eee', 'draft'
        return format_html(
            '<span style="color:{}; background:{}; padding:2px 8px; '
            'border-radius:10px; font-size:11px;">{}</span>', color, bg, label
        )
    status_badge.short_description = 'Status'

    def save_model(self, request, obj, form, change):
        """Auto-stamp created_by (once) and approved_by/approved_at (only
        when a superuser is the one flipping is_approved on)."""
        if not change:
            obj.created_by = request.user

        if obj.is_approved and not obj.approved_by and request.user.is_superuser:
            from django.utils import timezone
            obj.approved_by = request.user
            obj.approved_at = timezone.now()

        super().save_model(request, obj, form, change)

    # --- Admin actions (bulk operations from the list view) ---
    @admin.action(description="Approve selected versions (superadmin only)")
    def approve_selected(self, request, queryset):
        if not request.user.is_superuser:
            self.message_user(request, "Only a superadmin can approve documents.", level='error')
            return
        from django.utils import timezone
        updated = queryset.update(
            is_approved=True, approved_by=request.user, approved_at=timezone.now()
        )
        self.message_user(request, f"Approved {updated} document(s).")

    @admin.action(description="Activate selected (makes each the live version for its doc_type)")
    def activate_selected(self, request, queryset):
        activated, skipped = 0, 0
        for doc in queryset:
            try:
                doc.activate()
                activated += 1
            except ValueError:
                skipped += 1
        self.message_user(
            request,
            f"Activated {activated} document(s)."
            + (f" Skipped {skipped} unapproved document(s)." if skipped else ""),
        )

    @admin.action(description="Soft-delete selected (never hard-deletes)")
    def soft_delete_selected(self, request, queryset):
        count = 0
        for doc in queryset:
            doc.soft_delete()
            count += 1
        self.message_user(request, f"Soft-deleted {count} document(s).")

    # --- Block the default hard-delete entirely ---
    def has_delete_permission(self, request, obj=None):
        # Nobody gets the real "Delete" button/action here — this is now
        # a secondary line of defense; the primary one is that
        # LegalDocument.delete() itself raises PermissionError (see
        # models.py), so even code that bypasses the admin UI can't
        # hard-delete a row. soft_delete_selected (above) is the only
        # supported way to remove a document from view.
        return False
