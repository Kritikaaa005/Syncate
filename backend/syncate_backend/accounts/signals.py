"""
accounts/signals.py

The real fix for issue #4 ("you can't delete yourself" only worked from
the dashboard).

Why not just replicate the dashboard's "can't delete your own account"
check here at the signal level? Because "self" only means something
inside an HTTP request — a Django signal receiver has no idea who's
"currently logged in" when a script or shell calls `user.delete()`.
There's no honest way to answer "is this the same person deleting
themselves" outside a request/response cycle.

So instead of a self-check, this enforces the actual underlying safety
goal: the system should never be left with zero superadmin accounts.
Whether it's you deleting yourself, someone deleting the only other
superadmin, or a script wiping the table — if a delete would take the
superuser count to zero, it's blocked. This is a stronger guarantee than
the old rule, and — unlike "can't delete yourself" — it's enforceable
everywhere, since `pre_delete` fires for every ORM-level delete path
(admin UI, shell, scripts, `instance.delete()`, and per-instance during a
queryset `.delete()` — everything except raw SQL, which nothing at the
Python/ORM layer can ever fully prevent).
"""
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db.models.signals import pre_delete
from django.dispatch import receiver


@receiver(pre_delete, sender=User)
def block_deleting_the_last_superuser(sender, instance, **kwargs):
    """Refuses to delete a User if doing so would leave zero superusers
    in the system. Raises PermissionDenied (not a silent no-op) so
    whatever triggered the delete — admin UI, shell, script — gets a
    clear, loud error instead of quietly failing."""
    if not instance.is_superuser:
        return  # deleting a non-superuser is never a lockout risk

    remaining_superusers = User.objects.filter(is_superuser=True).exclude(pk=instance.pk).count()

    if remaining_superusers == 0:
        raise PermissionDenied(
            "Refusing to delete the last remaining superadmin account — "
            "this would lock everyone out of the admin panel. Promote "
            "another user to superadmin first."
        )
