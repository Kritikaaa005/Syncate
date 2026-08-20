"""
Service functions the articles app exposes to other apps.

Other apps (e.g. cycle_tracking) should call these instead of
querying EducationalContent directly -- that keeps "how a phase's
article is resolved" an implementation detail owned by this app.
"""

from .models import EducationalContent


def get_primary_article_slug_for_phase(phase_key):
    """
    Return the slug of the one published article assigned to the
    given phase (EducationalContent.phase), or None if no article
    is currently assigned to it.
    """

    article = (
        EducationalContent.objects.filter(
            phase=phase_key,
            is_published=True,
            is_deleted=False,
        )
        .only("slug")
        .first()
    )

    return article.slug if article else None


def phase_conflict_exists(phase_key, exclude_pk=None):
    """
    True if some OTHER published, non-deleted article is already
    assigned to this phase.

    This is the single place that mirrors the DB-level guarantee in
    models.py (UniqueConstraint "one_published_article_per_phase").
    The DB constraint is what actually prevents two published articles
    from sharing a phase, no matter which code path saves the row;
    this helper exists so every *front door* onto that path (the DRF
    serializer, the admin form, the `publish` action) can give a nice
    validation error instead of letting people hit a raw IntegrityError.
    """

    if not phase_key:
        return False

    queryset = EducationalContent.objects.filter(
        phase=phase_key,
        is_published=True,
        is_deleted=False,
    )

    if exclude_pk is not None:
        queryset = queryset.exclude(pk=exclude_pk)

    return queryset.exists()