"""
accounts/admin.py

We are NOT creating a new User model here — we reuse Django's built-in
django.contrib.auth.User for admin-panel staff/superadmin accounts. This
file only customizes the ALREADY-REGISTERED User admin to add dashboard-
level safety rules on top of it.

Two separate lines of defense, and it matters which is which:
------------------------------------------------------------------------
1. DASHBOARD-level (this file): stops someone clicking delete on their
   own row, or bulk-deleting a selection that happens to include
   themselves, from the admin UI specifically. Nice UX, immediate
   feedback — but only covers this one screen.

2. DATABASE-level (signals.py): a `pre_delete` signal on User that
   refuses to delete the last remaining superuser account, no matter
   what deletes it — the admin UI, a management shell, a future script,
   a data migration. This is the actual safety net; #1 is just a
   friendlier front door on top of it.

FIX for issue #3 (the old bug this file used to have):
------------------------------------------------------------------------
There used to be a `get_actions()` override here whose docstring claimed
it "strips out the bulk delete action" when your own account is among the
selected rows. The code underneath just did `return actions` — completely
unchanged. It couldn't have worked anyway: get_actions() runs when the
list page is rendered, BEFORE the admin has selected any rows, so there's
no "is the current user among the selection" to check yet. It was dead,
misleading code, so it's gone. `delete_queryset()` below is the actual,
correct place to guard the BULK delete action (it runs after selection,
with the real queryset) — it was already doing the real work; the
now-deleted get_actions() was just adding a lie on top of it.

FIX for issue #4 (self-delete / admin-account deletion only blocked here):
------------------------------------------------------------------------
See signals.py — `has_delete_permission` and `delete_queryset` below only
protect the dashboard. The real, code-path-independent guarantee ("the
system can never be left with zero superadmins") now lives in a
pre_delete signal instead.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


class SafeUserAdmin(UserAdmin):
    """Stock Django UserAdmin, plus: you can't delete your own account
    from this screen (dashboard-level convenience — see module docstring
    for why the real protection lives in signals.py instead)."""

    def has_delete_permission(self, request, obj=None):
        """
        Called by Django admin to decide whether to show/allow the delete
        button or action for a given row.

        `obj` is None when Django is just checking "does this user have
        delete permission on this model at all" (e.g. to decide whether to
        show the checkbox column) — in that case we defer to the normal
        permission system. `obj` is set when checking a SPECIFIC row, which
        is when we block deleting yourself.
        """
        if obj is not None and obj.pk == request.user.pk:
            return False
        return super().has_delete_permission(request, obj)

    def delete_queryset(self, request, queryset):
        """Guard for the BULK 'delete selected' action: silently exclude
        the current admin's own account from whatever was selected, so
        the rest of the batch still goes through instead of erroring out
        on the whole selection."""
        queryset = queryset.exclude(pk=request.user.pk)
        super().delete_queryset(request, queryset)


# Replace Django's default registration of User with our safer version.
admin.site.unregister(User)
admin.site.register(User, SafeUserAdmin)
