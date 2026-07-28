"""
legal_docs/managers.py

Custom QuerySet + Manager for LegalDocument.

Why this is its own file (SRP):
-------------------------------
"How rows get fetched/filtered" and "how rows get (soft-)deleted" are a
different concern from "what fields does this model have" (models.py) and
a different concern again from "what does the Django admin UI look like"
(admin.py). Keeping it here means all three can be read/changed on their
own without wading through the others.

The bug we're fixing (issue #2 from the review):
--------------------------------------------------
The old code only blocked hard-delete in admin.py, via
`has_delete_permission() -> False`. That only stops someone clicking the
delete button *in the Django admin dashboard*. It does nothing to stop:

    LegalDocument.objects.get(pk=5).delete()          # from a shell
    LegalDocument.objects.filter(doc_type=x).delete()  # from a script
    SomeFutureCeleryTask does the same thing

...because none of those go through the admin UI at all — they call
Django's normal ORM delete methods directly.

Fix: we override `.delete()` on BOTH the QuerySet (bulk delete) and the
Manager doesn't need its own override — Model.delete() is overridden in
models.py instead, since instance-level delete belongs to the model, not
the manager. This file only handles the *queryset-level* bulk delete,
because that's a manager/queryset concern.

End result: no matter what code path calls .delete() — admin, shell,
future API, a data migration — it's blocked at the ORM layer itself,
not just in one UI screen. The only sanctioned way to remove a document
from normal view is `LegalDocument.soft_delete()` (see models.py).
"""
from django.db import models


class LegalDocumentQuerySet(models.QuerySet):
    """Custom queryset so bulk `.delete()` calls are blocked too, not just
    single-instance `.delete()` (that one's overridden on the model itself)."""

    def delete(self):
        # This is the ORM-level bulk delete, e.g.
        # LegalDocument.objects.filter(...).delete() — Django would
        # normally run real SQL DELETE statements here. We refuse.
        raise PermissionError(
            "Bulk hard-delete is disabled for LegalDocument. "
            "Loop over the queryset and call .soft_delete() on each row "
            "instead — see legal_docs/models.py for why."
        )


class ActiveDocumentsManager(models.Manager.from_queryset(LegalDocumentQuerySet)):
    """Default manager: `LegalDocument.objects` — only returns
    non-soft-deleted rows, so nobody has to remember to add
    `.filter(is_deleted=False)` themselves every single time."""

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


# Second manager, same queryset class (so it still blocks hard bulk-delete),
# but without the is_deleted filter — for the admin's "show everything,
# including soft-deleted" view, and for audits.
AllDocumentsManager = models.Manager.from_queryset(LegalDocumentQuerySet)
