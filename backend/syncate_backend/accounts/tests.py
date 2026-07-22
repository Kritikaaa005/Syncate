"""
accounts/tests.py

Covers issue #4 ("can't delete yourself only worked from the dashboard")
and confirms the fix for issue #3 didn't break the still-legitimate
"admin excludes self from bulk delete" behavior.

Run with:  python manage.py test accounts
"""
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.test import TestCase


class LastSuperuserProtectionTests(TestCase):
    """The signal in signals.py — this is the part that works no matter
    what code path triggers the delete, not just the admin dashboard.

    Note the `with transaction.atomic():` wrapped around every call that's
    expected to raise below. Model.delete() runs inside Django's own
    internal (savepoint-less) transaction, so when the signal raises
    partway through, it needs ITS OWN savepoint to roll back to — otherwise
    it poisons the whole test's outer transaction and even the very next
    assertion query (`User.objects.filter(...).exists()`) fails with
    "You can't execute queries until the end of the 'atomic' block."
    Wrapping the call in its own atomic() gives Django that savepoint.
    """

    def test_deleting_the_only_superuser_is_blocked(self):
        only_superuser = User.objects.create_superuser('root', 'root@example.com', 'pw')

        with self.assertRaises(PermissionDenied):
            with transaction.atomic():
                only_superuser.delete()  # plain ORM call — no admin UI involved

        # row is untouched
        self.assertTrue(User.objects.filter(pk=only_superuser.pk).exists())

    def test_deleting_a_superuser_is_fine_if_another_one_remains(self):
        first = User.objects.create_superuser('root1', 'root1@example.com', 'pw')
        User.objects.create_superuser('root2', 'root2@example.com', 'pw')

        first.delete()  # should NOT raise — one superuser is still left

        self.assertFalse(User.objects.filter(pk=first.pk).exists())

    def test_deleting_a_non_superuser_is_never_blocked(self):
        User.objects.create_superuser('root', 'root@example.com', 'pw')
        regular_staff = User.objects.create_user('staffer', is_staff=True)

        regular_staff.delete()  # not a superuser, so no lockout risk

        self.assertFalse(User.objects.filter(pk=regular_staff.pk).exists())

    def test_bulk_queryset_delete_also_respects_the_rule(self):
        """pre_delete fires per-instance even during a queryset .delete(),
        so this should raise partway through and leave the last superuser
        untouched, not silently wipe everyone."""
        only_superuser = User.objects.create_superuser('root', 'root@example.com', 'pw')

        with self.assertRaises(PermissionDenied):
            with transaction.atomic():
                User.objects.filter(is_superuser=True).delete()

        self.assertTrue(User.objects.filter(pk=only_superuser.pk).exists())