from datetime import date

from django.contrib.auth.models import User
from django.test import TestCase

from .models import CycleProfile, PeriodLog
from .services import build_calendar_for_user, calculate_cycle_dashboard


class CycleCalendarLogicTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="calendar-user")
        self.profile = CycleProfile.objects.create(
            user=self.user,
            cycle_length_days=28,
            cycle_length_confidence=CycleProfile.EstimateConfidence.EXACT,
            period_length_days=5,
            period_length_confidence=CycleProfile.EstimateConfidence.EXACT,
        )

    def calendar_day(self, value: str):
        year = int(value[:4])
        calendar = build_calendar_for_user(self.user, year)
        return next(day for day in calendar["days"] if day["date"] == value)

    def test_early_actual_period_replaces_old_estimated_period_anchor(self):
        PeriodLog.objects.create(
            user=self.user,
            start_date=date(2026, 8, 8),
            end_date=date(2026, 8, 12),
        )

        # Before the correction, Sep 5 is cycle day 1 from the Aug 8 anchor.
        before = self.calendar_day("2026-09-05")
        self.assertEqual(before["phase"], "menstrual")
        self.assertEqual(before["source"], "estimated")

        # The user actually starts on Aug 29, earlier than the Sep 5 estimate.
        PeriodLog.objects.create(
            user=self.user,
            start_date=date(2026, 8, 29),
        )

        self.assertEqual(self.calendar_day("2026-08-29")["source"], "logged")

        # The usual 5-day duration is estimated from the new real start.
        for value in ("2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02"):
            day = self.calendar_day(value)
            self.assertEqual(day["phase"], "menstrual")
            self.assertEqual(day["source"], "estimated")

        # The old Sep 5 menstrual estimate is gone because Aug 29 is now
        # the governing cycle anchor.
        after = self.calendar_day("2026-09-05")
        self.assertNotEqual(after["phase"], "menstrual")
        self.assertEqual(after["source"], "estimated")

    def test_extending_same_period_does_not_restart_another_five_day_window(self):
        period = PeriodLog.objects.create(
            user=self.user,
            start_date=date(2026, 8, 29),
        )

        # The user is still bleeding Sep 3, so the same row gets an end date.
        period.end_date = date(2026, 9, 3)
        period.save()

        sep_3 = self.calendar_day("2026-09-03")
        self.assertEqual(sep_3["phase"], "menstrual")
        self.assertEqual(sep_3["source"], "logged")

        # Critically, Sep 3 did not become a NEW cycle start. Sep 4 therefore
        # follows the Aug 29 cycle rather than receiving another 5-day block.
        sep_4 = self.calendar_day("2026-09-04")
        self.assertNotEqual(sep_4["phase"], "menstrual")
        self.assertEqual(sep_4["source"], "estimated")
        self.assertEqual(PeriodLog.objects.filter(user=self.user).count(), 1)

    def test_calendar_uses_saved_period_duration_instead_of_hard_coded_five_days(self):
        self.profile.period_length_days = 7
        self.profile.save()

        PeriodLog.objects.create(
            user=self.user,
            start_date=date(2026, 8, 29),
        )

        sep_4 = self.calendar_day("2026-09-04")
        self.assertEqual(sep_4["phase"], "menstrual")
        self.assertEqual(sep_4["source"], "estimated")

        sep_5 = self.calendar_day("2026-09-05")
        self.assertNotEqual(sep_5["phase"], "menstrual")

    def test_dashboard_phase_uses_saved_period_duration_too(self):
        dashboard = calculate_cycle_dashboard(
            last_period_start_date=date(2026, 8, 29),
            cycle_length=28,
            period_length=7,
            today=date(2026, 9, 4),
        )

        self.assertEqual(dashboard["cycle_day"], 7)
        self.assertEqual(dashboard["phase"]["key"], "menstrual")