# LOCATION: syncate-backend/cycle_tracking/migrations/0002_period_log_and_profile_refactor.py
# (new file — run `python manage.py makemigrations` after dropping this in
#  to double check Django agrees this matches models.py exactly, then
#  `python manage.py migrate`)
#
# No data migration here on purpose — we're still in dev with no real
# users, so there's nothing in last_period_start_date worth preserving.
# If that ever stops being true, don't reuse this file, write a proper
# data migration that copies old values into a PeriodLog row first.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("cycle_tracking", "0001_initial"),
    ]

    operations = [
        # --- old single-value fields gone, replaced by defaults + confidence ---
        migrations.RemoveField(
            model_name="cycleprofile",
            name="last_period_start_date",
        ),
        migrations.RemoveField(
            model_name="cycleprofile",
            name="last_period_status",
        ),
        migrations.AddField(
            model_name="cycleprofile",
            name="cycle_length_days",
            field=models.PositiveSmallIntegerField(default=28),
        ),
        migrations.AddField(
            model_name="cycleprofile",
            name="cycle_length_confidence",
            field=models.CharField(
                choices=[
                    ("exact", "Exact"),
                    ("estimated", "Estimated"),
                    ("unknown", "Unknown"),
                ],
                default="unknown",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="cycleprofile",
            name="period_length_days",
            field=models.PositiveSmallIntegerField(default=5),
        ),
        migrations.AddField(
            model_name="cycleprofile",
            name="period_length_confidence",
            field=models.CharField(
                choices=[
                    ("exact", "Exact"),
                    ("estimated", "Estimated"),
                    ("unknown", "Unknown"),
                ],
                default="unknown",
                max_length=20,
            ),
        ),
        # --- the actual history table ---
        migrations.CreateModel(
            name="PeriodLog",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                (
                    "date_confidence",
                    models.CharField(
                        choices=[("exact", "Exact"), ("estimated", "Estimated")],
                        default="exact",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="period_logs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Period Log",
                "verbose_name_plural": "Period Logs",
                "ordering": ["-start_date"],
            },
        ),
        migrations.AddConstraint(
            model_name="periodlog",
            constraint=models.UniqueConstraint(
                fields=("user", "start_date"),
                name="unique_period_start_per_user",
            ),
        ),
    ]
