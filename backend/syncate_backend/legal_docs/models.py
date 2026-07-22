"""
legal_docs/models.py

Stores the Terms & Conditions / Privacy Policy content shown inside the
mobile app. Managed via the Django admin (CRUD) and read via the public
API (see views.py) that the mobile app actually calls.

WHY THIS SHAPE (read this before changing anything):
------------------------------------------------------
1. Guest users and registered users see DIFFERENT legal text (the app
   stores real personal data for registered users; guest mode explicitly
   stores nothing). So each row is tagged with a `doc_type` that captures
   BOTH which policy it is (terms vs privacy) AND which audience it's for
   (guest vs registered) — 4 combinations total.

2. Legal text changes over time, and every change is a NEW ROW (v1, v2,
   v3...), never an overwrite of an old one. You need that history for
   disputes/audits ("the user agreed to v1.2, which said X").

3. Two-step publishing workflow, matching the admin tiers:
   - Any admin can create a draft version (`is_approved=False`).
   - Only a SUPERADMIN can approve it (`is_approved=True`, `approved_by`
     set) — see LegalDocumentAdmin.approve_selected in admin.py.
   - Only an APPROVED version can be made `is_active` (the one actually
     shown in the app). This stops a regular admin from unilaterally
     publishing unreviewed legal text.

4. Never hard-deleted. `is_deleted` is a soft-delete flag — the row
   always stays in the database. Real SQL DELETE is blocked at the ORM
   layer (see managers.py + `delete()` below), not just in the admin UI.

FIXES APPLIED HERE (mapped to the review's numbering, for anyone diffing
against the old version):
------------------------------------------------------------------------
#1 — Race condition on "only one active version per doc_type":
     Old code only checked this in Python, inside save(), by doing a
     filter().update() right before super().save(). Two requests hitting
     save() at the same instant could both pass that check before either
     one's write lands. Fixed properly with a Postgres PARTIAL UNIQUE
     INDEX (the `constraints` list below) — the database itself now
     refuses to ever store two `is_active=True` rows for the same
     doc_type, full stop, no matter what code path tries it or how the
     timing lines up. The Python-level "deactivate the old one first"
     logic still exists (in `activate()`), but it's now a nicety for a
     clean transaction, not the actual safety mechanism — the DB
     constraint is the safety mechanism.

#2 — Hard delete only blocked in the admin dashboard:
     Fixed via managers.py (bulk delete) and `delete()` below (single-row
     delete). See managers.py docstring for the full explanation.

#8 — Version field accepted literally anything ("banana" included):
     Fixed with `version_format_validator` (see validators.py), which is
     wired into both `full_clean()` (used by admin forms + DRF
     serializers) — not silently skipped just because someone calls
     `.save()` directly without going through a form.

#9 — Stale approval metadata after un-approving a document:
     Old code let `approved_by` / `approved_at` sit there forever once
     set, even after `is_approved` got flipped back to False — so the
     record would misleadingly still say "approved by X on date Y" for a
     document that is, right now, NOT approved. Fixed in `save()`: any
     time `is_approved` is False, we force `approved_by`/`approved_at`
     back to None too, so the two fields can never disagree.
"""
from django.conf import settings
from django.db import models, transaction
from django.db.models import Q

from .managers import ActiveDocumentsManager, AllDocumentsManager
from .validators import version_format_validator


class LegalDocument(models.Model):
    """A single version of a legal document (Terms & Conditions or Privacy
    Policy), scoped to either guest users or registered users."""

    class DocType(models.TextChoices):
        # value stored in DB, human-readable label shown in admin dropdowns
        GUEST_TERMS = 'guest_terms', 'Guest — Terms & Conditions'
        GUEST_PRIVACY = 'guest_privacy', 'Guest — Privacy Policy'
        REGISTERED_TERMS = 'registered_terms', 'Registered User — Terms & Conditions'
        REGISTERED_PRIVACY = 'registered_privacy', 'Registered User — Privacy Policy'

    document_id = models.BigAutoField(primary_key=True)

    doc_type = models.CharField(
        max_length=32,
        choices=DocType.choices,
        db_index=True,
        help_text="Which policy this is, and which audience (guest vs registered) it applies to.",
    )

    version = models.CharField(
        max_length=20,
        validators=[version_format_validator],
        help_text='Numbers only, dot-separated, e.g. "1.0", "1.1", "2.0". '
                   'Bump this every time you publish a change.',
    )

    title = models.CharField(
        max_length=255,
        help_text="Heading shown at the top of the document in the app.",
    )

    content = models.TextField(
        help_text="Full legal text. Supports plain text or basic Markdown — "
                   "whatever the mobile team decides to render.",
    )

    effective_date = models.DateField(
        help_text='Date this version takes/took effect. Shown to users as '
                   '"Last updated: ..." in the app.',
    )

    # --- Approval workflow (superadmin sign-off, not end-user facing) ---
    is_approved = models.BooleanField(
        default=False,
        help_text="Set ONLY by a superadmin (see the 'Approve selected' "
                   "admin action). A version must be approved before it "
                   "can be made active/live.",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='legal_documents_approved',
        help_text="Which superadmin approved this version (auto-set, not editable). "
                  "Cleared automatically if is_approved is ever turned back off.",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    # --- Publishing (which approved version is actually live) ---
    is_active = models.BooleanField(
        default=False,
        help_text="Only ONE version per doc_type can be active at a time — "
                   "this is what the mobile app fetches and shows. Must be "
                   "an approved version. Enforced by a DB constraint, not "
                   "just app logic — see the Meta.constraints below.",
    )

    # --- Soft delete — rows are NEVER hard-deleted, see module docstring ---
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft-delete flag. True = hidden from normal use and "
                   "excluded from what the app can fetch. The row itself "
                   "is never removed from the database.",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='legal_documents_created',
        help_text="Which admin created this version (auto-set, not editable).",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # `LegalDocument.objects` -> excludes soft-deleted rows (safe default,
    # used everywhere including the public API in views.py).
    objects = ActiveDocumentsManager()
    # `LegalDocument.all_objects` -> everything, including soft-deleted rows
    # (only use this in the admin's "show deleted" view / audits).
    all_objects = AllDocumentsManager()

    class Meta:
        ordering = ['doc_type', '-effective_date', '-created_at']
        verbose_name = "Legal Document"
        verbose_name_plural = "Legal Documents"
        constraints = [
            # THE fix for issue #1 (see module docstring). Postgres treats
            # this as a *partial* unique index: it only applies to rows
            # where is_active=True, so any number of inactive/draft
            # versions can coexist per doc_type — just never two active
            # ones. This is enforced by Postgres itself at write time, so
            # it holds even under concurrent requests, even if someone
            # bypasses activate() entirely and writes raw SQL.
            models.UniqueConstraint(
                fields=['doc_type'],
                condition=Q(is_active=True),
                name='unique_active_legal_document_per_doc_type',
            ),
        ]

    def __str__(self):
        status = " (LIVE)" if self.is_active else (" (approved)" if self.is_approved else " (draft)")
        deleted = " [DELETED]" if self.is_deleted else ""
        return f"{self.get_doc_type_display()} — v{self.version}{status}{deleted}"

    # ------------------------------------------------------------------
    # Save / validation
    # ------------------------------------------------------------------
    def save(self, *args, **kwargs):
        """
        A few rules enforced here so they hold no matter what writes to
        this model in future (a management command, a future API
        endpoint, a data migration, etc) — not just the admin form:

        1. Run full_clean()-style field validation (version format etc.)
           so `LegalDocument(...).save()` can't skip it just because
           nobody called a ModelForm.
        2. Can't be `is_active` unless `is_approved` (belt-and-braces —
           the DB constraint stops two ACTIVE rows, but doesn't by itself
           stop an unapproved one from being active; this does).
        3. If `is_approved` is False, approval metadata is always cleared
           (fixes issue #9 — no more stale "approved by X" on an
           unapproved doc).
        """
        if self.is_active and not self.is_approved:
            raise ValueError(
                "Cannot activate a LegalDocument that hasn't been approved yet."
            )

        if not self.is_approved:
            self.approved_by = None
            self.approved_at = None

        # Validates field-level rules (like the version regex) even for
        # direct .save() calls that skip a ModelForm entirely.
        self.full_clean(exclude=['created_by', 'approved_by'])

        super().save(*args, **kwargs)

    def activate(self):
        """
        Make this version the live one for its doc_type, atomically
        deactivating whatever was previously live.

        This is a *convenience* for a clean single transaction — the real
        safety net against two-active-at-once is the DB constraint in
        Meta.constraints, which holds even if this method is skipped
        entirely. select_for_update() locks the currently-active row (if
        any) for the duration of the transaction, so a second concurrent
        call has to wait its turn instead of racing.
        """
        if not self.is_approved:
            raise ValueError("Cannot activate a LegalDocument that hasn't been approved yet.")

        with transaction.atomic():
            (
                LegalDocument.all_objects
                .select_for_update()
                .filter(doc_type=self.doc_type, is_active=True)
                .exclude(pk=self.pk)
                .update(is_active=False)
            )
            self.is_active = True
            self.save(update_fields=['is_active', 'updated_at'])

    def soft_delete(self):
        """Use this instead of .delete() — see managers.py + module
        docstring for why we never hard-delete legal documents. Also
        un-publishes it if it was the live version, since a deleted doc
        obviously can't stay live."""
        self.is_deleted = True
        self.is_active = False
        self.save(update_fields=['is_deleted', 'is_active', 'updated_at'])

    def delete(self, *args, **kwargs):
        """Blocks single-row hard delete (e.g. `some_doc.delete()` from a
        shell or script). Paired with the queryset-level block in
        managers.py for bulk `.filter(...).delete()` calls. Together
        these close both the paths the old admin-only check missed —
        this is the fix for issue #2."""
        raise PermissionError(
            "LegalDocument rows are never hard-deleted. Call "
            "soft_delete() instead — see models.py for why."
        )

    # ------------------------------------------------------------------
    # Read-side helper
    # ------------------------------------------------------------------
    @classmethod
    def get_active(cls, doc_type: str):
        """
        Convenience lookup used by the public API (views.py) to answer
        "give me the current Privacy Policy for a guest user".
        Usage: LegalDocument.get_active(LegalDocument.DocType.GUEST_TERMS)
        """
        return cls.objects.filter(doc_type=doc_type, is_active=True).first()
