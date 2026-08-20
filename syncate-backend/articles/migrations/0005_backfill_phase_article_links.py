# Links the four phase-explainer articles that were previously matched
# by hardcoded slug (in the frontend) to their EducationalContent.phase
# field instead. Safe to run whether or not seed_cycle_phase_articles
# has been run yet -- articles that don't exist are simply skipped.

from django.db import migrations

SLUG_TO_PHASE = {
    "understanding-the-menstrual-phase": "menstrual",
    "understanding-the-follicular-phase": "follicular",
    "understanding-ovulation": "ovulation",
    "understanding-the-luteal-phase": "luteal",
}


def backfill_phase(apps, schema_editor):
    EducationalContent = apps.get_model("articles", "EducationalContent")

    for slug, phase in SLUG_TO_PHASE.items():
        EducationalContent.objects.filter(slug=slug).update(phase=phase)


def clear_phase(apps, schema_editor):
    EducationalContent = apps.get_model("articles", "EducationalContent")

    EducationalContent.objects.filter(
        slug__in=SLUG_TO_PHASE.keys()
    ).update(phase=None)


class Migration(migrations.Migration):

    dependencies = [
        ("articles", "0004_educationalcontent_phase_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_phase, reverse_code=clear_phase),
    ]
