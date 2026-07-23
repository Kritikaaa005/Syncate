"""
legal_docs/tests.py

The fix for issue #7 ("zero tests, nothing checks the rules keep
working"). Each test below is written to map directly onto one numbered
issue from the review, so if a future change ever breaks a rule, the
failing test name tells you exactly which rule it was.

Run with:  python manage.py test legal_docs
"""
from datetime import date

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import LegalDocument, LegalDocumentAcceptance


def make_doc(**overrides):
    """Small helper so every test isn't copy-pasting the same 4 required
    fields. Defaults to a draft, unapproved, guest-terms document."""
    defaults = dict(
        doc_type=LegalDocument.DocType.GUEST_TERMS,
        version='1.0',
        title='Guest Terms & Conditions',
        content='Some legal text.',
        effective_date=date(2026, 1, 1),
    )
    defaults.update(overrides)
    return LegalDocument.objects.create(**defaults)


class OnlyOneActivePerDocTypeTests(TestCase):
    """Issue #1: two documents could both end up "live" at once."""

    def test_activate_deactivates_previous_active_version(self):
        doc_v1 = make_doc(version='1.0', is_approved=True)
        doc_v1.activate()

        doc_v2 = make_doc(version='1.1', is_approved=True)
        doc_v2.activate()

        doc_v1.refresh_from_db()
        self.assertFalse(doc_v1.is_active)
        self.assertTrue(doc_v2.is_active)

    def test_db_constraint_rejects_two_active_rows_even_bypassing_activate(self):
        """The real fix isn't activate() — it's the DB constraint. Prove
        it by trying to sneak past activate() entirely with a raw save().

        Why this asserts ValidationError, not IntegrityError: save() calls
        full_clean() (for the version-format fix, #8), and Django 4.1+'s
        full_clean() calls validate_constraints() as part of that — which
        pre-checks Meta.constraints against the database *before* the SQL
        INSERT/UPDATE even runs, and raises a ValidationError if a matching
        row already exists. So the constraint still stops this, it just
        gets caught a step earlier than a raw IntegrityError would be, and
        surfaces as a friendlier, more catchable exception. Same
        guarantee, nicer failure mode.
        """
        doc_v1 = make_doc(version='1.0', is_approved=True, is_active=True)

        doc_v2 = LegalDocument(
            doc_type=LegalDocument.DocType.GUEST_TERMS,
            version='1.1',
            title='Guest Terms & Conditions',
            content='Updated text.',
            effective_date=date(2026, 2, 1),
            is_approved=True,
            is_active=True,  # <- trying to go live without deactivating v1 first
        )

        with self.assertRaises(ValidationError):
            with transaction.atomic():
                doc_v2.save()

    def test_raw_db_constraint_holds_even_with_validation_bypassed(self):
        """Belt-and-braces version of the test above: prove the guarantee
        doesn't actually depend on full_clean() being called at all — i.e.
        the database itself refuses this, not just our Python validation.

        `.update()` at the queryset level never calls save() or
        full_clean() — it's a direct SQL UPDATE — so this hits the real
        Postgres partial unique index with nothing in between.
        """
        make_doc(version='1.0', is_approved=True, is_active=True)
        doc_v2 = make_doc(version='1.1', is_approved=True, is_active=False)

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                LegalDocument.objects.filter(pk=doc_v2.pk).update(is_active=True)

    def test_cannot_activate_unapproved_document(self):
        draft = make_doc(is_approved=False)
        with self.assertRaises(ValueError):
            draft.activate()


class HardDeleteBlockedTests(TestCase):
    """Issue #2: "no hard delete" only worked from the admin dashboard."""

    def test_instance_delete_is_blocked(self):
        doc = make_doc()
        with self.assertRaises(PermissionError):
            doc.delete()
        # row is still there
        self.assertTrue(LegalDocument.all_objects.filter(pk=doc.pk).exists())

    def test_queryset_bulk_delete_is_blocked(self):
        make_doc()
        with self.assertRaises(PermissionError):
            LegalDocument.objects.all().delete()
        self.assertEqual(LegalDocument.all_objects.count(), 1)

    def test_soft_delete_hides_but_does_not_remove_the_row(self):
        doc = make_doc(is_approved=True, is_active=True)
        doc.soft_delete()

        self.assertTrue(LegalDocument.all_objects.filter(pk=doc.pk).exists())
        self.assertFalse(LegalDocument.objects.filter(pk=doc.pk).exists())  # hidden from default manager
        doc.refresh_from_db()
        self.assertTrue(doc.is_deleted)
        self.assertFalse(doc.is_active)  # soft-deleting also un-publishes


class VersionFormatTests(TestCase):
    """Issue #8: version field accepted literally anything."""

    def test_rejects_non_numeric_version(self):
        with self.assertRaises(ValidationError):
            make_doc(version='banana')

    def test_accepts_major_minor_versions(self):
        for good_version in ['1.0', '1.1', '2.0', '10.20']:
            doc = make_doc(version=good_version, title=f'v{good_version}')
            self.assertEqual(doc.version, good_version)

    def test_rejects_anything_other_than_major_minor(self):
        """Locked to major.minor only — no bare integers, no patch
        numbers. Product decision, not just a technical default."""
        for bad_version in ['1', '1.2.3', '10.20.30', 'v1.0', '1.0-beta']:
            with self.assertRaises(ValidationError):
                make_doc(version=bad_version, title=f'bad-{bad_version}')


class ApprovalMetadataTests(TestCase):
    """Issue #9: un-approving a document left stale approved_by/approved_at."""

    def test_unapproving_clears_approved_by_and_approved_at(self):
        admin_user = User.objects.create_user('admin', is_staff=True)
        doc = make_doc(is_approved=True, approved_by=admin_user)
        self.assertIsNotNone(doc.approved_by)

        doc.is_approved = False
        doc.save()
        doc.refresh_from_db()

        self.assertIsNone(doc.approved_by)
        self.assertIsNone(doc.approved_at)


class PublicLegalDocumentAPITests(APITestCase):
    """Issue #6: the mobile app had no way to fetch the current documents."""

    def setUp(self):
        self.active_doc = make_doc(is_approved=True, is_active=True)
        make_doc(version='0.9', title='Old draft', is_approved=False)  # should never show up

    def test_fetch_by_doc_type_returns_only_the_active_version(self):
        response = self.client.get(
            '/api/legal-documents/guest_terms/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], '1.0')

    def test_list_never_includes_drafts_or_unapproved_docs(self):
        response = self.client.get('/api/legal-documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.active_doc.document_id)


class AdminLegalDocumentAPITests(APITestCase):
    """Confirms the admin endpoint is actually locked down, and that
    DELETE soft-deletes instead of removing the row."""

    def setUp(self):
        self.staff_user = User.objects.create_user('staff', is_staff=True)
        self.doc = make_doc()

    def test_anonymous_user_cannot_reach_admin_endpoint(self):
        response = self.client.get('/api/admin/legal-documents/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_delete_soft_deletes_instead_of_removing_row(self):
        self.client.force_authenticate(self.staff_user)
        response = self.client.delete(f'/api/admin/legal-documents/{self.doc.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.doc.refresh_from_db()
        self.assertTrue(self.doc.is_deleted)


class LegalDocumentAcceptanceAPITests(APITestCase):
    """The registered-user counterpart to the guest flow's local
    AsyncStorage consent — server-side this time."""

    def setUp(self):
        self.user = User.objects.create_user('member')
        self.active_terms = make_doc(
            doc_type=LegalDocument.DocType.REGISTERED_TERMS,
            version='1.0',
            is_approved=True,
            is_active=True,
        )

    def test_anonymous_user_cannot_reach_acceptance_endpoints(self):
        response = self.client.get('/api/legal-documents/my-acceptances/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_accepting_records_the_currently_active_version(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            '/api/legal-documents/accept/', {'doc_type': 'registered_terms'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], '1.0')

        acceptance = LegalDocumentAcceptance.objects.get(user=self.user, doc_type='registered_terms')
        self.assertEqual(acceptance.version, '1.0')

    def test_client_supplied_version_is_ignored(self):
        """Only the doc_type is taken from the request — the version
        recorded is always whatever the server considers 'currently
        active', never something the client claims."""
        self.client.force_authenticate(self.user)
        response = self.client.post(
            '/api/legal-documents/accept/',
            {'doc_type': 'registered_terms', 'version': '99.9'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['version'], '1.0')  # not '99.9'

    def test_accepting_again_after_a_new_version_updates_the_same_row(self):
        self.client.force_authenticate(self.user)
        self.client.post('/api/legal-documents/accept/', {'doc_type': 'registered_terms'})

        self.active_terms.is_active = False
        self.active_terms.save()
        newer = make_doc(
            doc_type=LegalDocument.DocType.REGISTERED_TERMS,
            version='1.1',
            is_approved=True,
            is_active=True,
        )

        self.client.post('/api/legal-documents/accept/', {'doc_type': 'registered_terms'})

        self.assertEqual(
            LegalDocumentAcceptance.objects.filter(user=self.user, doc_type='registered_terms').count(),
            1,  # updated in place, not a second row
        )
        acceptance = LegalDocumentAcceptance.objects.get(user=self.user, doc_type='registered_terms')
        self.assertEqual(acceptance.version, '1.1')

    def test_my_acceptances_only_lists_what_was_actually_accepted(self):
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/legal-documents/my-acceptances/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])  # nothing accepted yet

        self.client.post('/api/legal-documents/accept/', {'doc_type': 'registered_terms'})
        response = self.client.get('/api/legal-documents/my-acceptances/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['doc_type'], 'registered_terms')

    def test_invalid_doc_type_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            '/api/legal-documents/accept/', {'doc_type': 'not_a_real_type'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_accepting_a_doctype_with_no_active_document_fails_cleanly(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            '/api/legal-documents/accept/', {'doc_type': 'registered_privacy'}
        )
        # registered_privacy has no active doc in this test's setUp
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
