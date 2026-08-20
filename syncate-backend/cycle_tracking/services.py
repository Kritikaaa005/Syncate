# LOCATION: syncate-backend/cycle_tracking/services.py
# (replaces the existing file)
#
# One thing changed on top of the PeriodLog stuff: build_dashboard_for_user()
# is new, and it's where "figure out the whole dashboard payload for this
# user" now lives. Previously that logic was sitting inside
# LastPeriodSerializer.to_representation(), which isn't really a
# serializer's job — a serializer should shape data, not go fetch related
# models and run business logic. Moving it here keeps that responsibility
# where it belongs (services.py = "figure stuff out", serializers.py =
# "shape it for the API", views.py = "wire up the request/response").

from datetime import date, timedelta
from typing import TypedDict

from articles.services import get_primary_article_slug_for_phase

from .models import CycleProfile, PeriodLog


DEFAULT_CYCLE_LENGTH = 28
ESTIMATED_OVULATION_DAY = 14


class PhaseDetails(TypedDict):
    key: str
    name: str
    display_name: str
    description: str


class CycleDashboardData(TypedDict):
    cycle_day: int
    cycle_length: int
    phase: PhaseDetails
    current_cycle_start_date: date
    next_period_date: date
    estimated_ovulation_date: date
    days_until_next_period: int
    days_until_ovulation: int
    prediction_basis: str


def get_cycle_phase(cycle_day: int) -> PhaseDetails:
    """
    Return an estimated cycle phase.

    These values are general estimates and must not be presented as
    medically exact predictions. (unchanged from before)
    """

    if cycle_day <= 5:
        return {
            "key": "menstrual",
            "name": "Menstrual Phase",
            "display_name": "Likely Menstrual Phase",
            "description": (
                "Your period may be active, and your body may need extra rest and care."
            ),
        }

    if cycle_day <= 13:
        return {
            "key": "follicular",
            "name": "Follicular Phase",
            "display_name": "Likely Follicular Phase",
            "description": "Your body may be preparing for ovulation.",
        }

    if cycle_day <= 16:
        return {
            "key": "ovulation",
            "name": "Ovulation Window",
            "display_name": "Estimated Ovulation Window",
            "description": "Ovulation may be approaching or happening around this time.",
        }

    return {
        "key": "luteal",
        "name": "Luteal Phase",
        "display_name": "Likely Luteal Phase",
        "description": "Your body may be preparing for your next period.",
    }


def calculate_cycle_dashboard(
    last_period_start_date: date,
    cycle_length: int = DEFAULT_CYCLE_LENGTH,
    today: date | None = None,
) -> CycleDashboardData:
    """
    Pure math: given a start date and a cycle length, work out where the
    user is in their cycle right now. Doesn't know or care where
    last_period_start_date came from (a real log vs a default) — that
    decision happens one level up, in build_dashboard_for_user().
    """

    current_date = today or date.today()

    if last_period_start_date > current_date:
        raise ValueError("Last period start date cannot be in the future.")

    if cycle_length < 21 or cycle_length > 45:
        raise ValueError("Cycle length must be between 21 and 45 days.")

    elapsed_days = (current_date - last_period_start_date).days
    completed_cycles = elapsed_days // cycle_length

    current_cycle_start_date = last_period_start_date + timedelta(
        days=completed_cycles * cycle_length
    )

    cycle_day = (current_date - current_cycle_start_date).days + 1

    next_period_date = current_cycle_start_date + timedelta(days=cycle_length)

    estimated_ovulation_date = current_cycle_start_date + timedelta(
        days=ESTIMATED_OVULATION_DAY - 1
    )

    days_until_next_period = max(0, (next_period_date - current_date).days)
    days_until_ovulation = (estimated_ovulation_date - current_date).days

    return {
        "cycle_day": cycle_day,
        "cycle_length": cycle_length,
        "phase": get_cycle_phase(cycle_day),
        "current_cycle_start_date": current_cycle_start_date,
        "next_period_date": next_period_date,
        "estimated_ovulation_date": estimated_ovulation_date,
        "days_until_next_period": days_until_next_period,
        "days_until_ovulation": days_until_ovulation,
        "prediction_basis": (
            "default_28_day_cycle" if cycle_length == DEFAULT_CYCLE_LENGTH else "user_cycle_length"
        ),
    }


def get_latest_period_log(user) -> PeriodLog | None:
    """
    "Last period" isn't a stored field anymore — it's just whichever
    PeriodLog row has the most recent start_date. Model's default
    ordering already does -start_date, so .first() is enough.
    """
    return PeriodLog.objects.filter(user=user).first()


def build_dashboard_for_user(user) -> dict:
    """
    The one place that decides what a user's dashboard looks like.

    Three states, matching the onboarding conversation:
    - no PeriodLog at all yet -> "awaiting_first_period". We can't
      predict anything without a real anchor date, so we don't even
      try — no guessing a start date out of thin air.
    - has at least one PeriodLog -> "known", predictions run off the
      latest one, using cycle_length_days from CycleProfile (which is
      either a real number the user gave us or the 28-day fallback).
    """

    latest_log = get_latest_period_log(user)

    if latest_log is None:
        return {
            "dashboard_state": "awaiting_first_period",
            "cycle_day": None,
            "cycle_length": None,
            "phase": None,
            "current_cycle_start_date": None,
            "next_period_date": None,
            "estimated_ovulation_date": None,
            "days_until_next_period": None,
            "days_until_ovulation": None,
            "prediction_basis": None,
        }

    cycle_profile, _ = CycleProfile.objects.get_or_create(user=user)

    dashboard = calculate_cycle_dashboard(
        last_period_start_date=latest_log.start_date,
        cycle_length=cycle_profile.cycle_length_days,
    )

    # phase -> "read more about this" link, same as before, just moved
    # here instead of living inside the serializer.
    phase_details = dict(dashboard["phase"])
    phase_details["article_slug"] = get_primary_article_slug_for_phase(phase_details["key"])

    return {
        "dashboard_state": "known",
        "cycle_day": dashboard["cycle_day"],
        "cycle_length": dashboard["cycle_length"],
        "phase": phase_details,
        "current_cycle_start_date": dashboard["current_cycle_start_date"].isoformat(),
        "next_period_date": dashboard["next_period_date"].isoformat(),
        "estimated_ovulation_date": dashboard["estimated_ovulation_date"].isoformat(),
        "days_until_next_period": dashboard["days_until_next_period"],
        "days_until_ovulation": dashboard["days_until_ovulation"],
        "prediction_basis": dashboard["prediction_basis"],
    }


# === NEW: everything below is for the year-long calendar view. Kept
# separate from calculate_cycle_dashboard() above on purpose — that
# function answers "where am I RIGHT NOW", this answers "what's the
# phase for EVERY day in a given year". Different question, but both
# lean on get_cycle_phase() so the actual phase boundaries (day <=5 is
# menstrual, etc.) only exist in ONE place in the whole codebase.

class CalendarDay(TypedDict):
    date: str
    phase: str | None
    source: str
    is_today: bool


def _build_day_entry(
    day: date,
    governing_log: PeriodLog | None,
    cycle_length: int,
    today: date,
) -> CalendarDay:
    """
    Figure out one single day's phase. governing_log is whichever
    PeriodLog most recently started on or before `day` — the caller
    walks the sorted log list forward alongside the date range so this
    function doesn't have to search every time (see build_calendar_for_user).
    """

    if governing_log is None:
        # This day comes before the person's very first-ever logged
        # period. There's no anchor to estimate from, so — same
        # philosophy as "awaiting_first_period" on the dashboard — we
        # don't guess. Left blank rather than inventing a phase.
        return {
            "date": day.isoformat(),
            "phase": None,
            "source": "none",
            "is_today": day == today,
        }

    if governing_log.start_date <= day <= (
        governing_log.end_date or governing_log.start_date
    ):
        # A real logged period covers this exact day — this is fact,
        # not an estimate, so it always wins over the tiled guess
        # below even if the tiled math would've said something else.
        # (The start_date itself always counts as "logged" even with
        # no end_date set — that one day is a real fact regardless of
        # whether the full period length is known yet.)
        return {
            "date": day.isoformat(),
            "phase": "menstrual",
            "source": "logged",
            "is_today": day == today,
        }

    # Between logged periods (or after the latest one, looking
    # forward): tile by cycle_length from whichever logged period
    # governs this stretch, same "elapsed days % cycle_length" idea
    # calculate_cycle_dashboard uses for "today".
    elapsed_days = (day - governing_log.start_date).days
    cycle_day = (elapsed_days % cycle_length) + 1
    phase = get_cycle_phase(cycle_day)

    return {
        "date": day.isoformat(),
        "phase": phase["key"],
        "source": "estimated",
        "is_today": day == today,
    }


def build_calendar_for_user(user, year: int) -> dict:
    """
    Every day of `year`, labeled with a phase. Real logged periods
    (PeriodLog rows) always win where they exist; gaps between them —
    and days after the latest one — get an estimated phase tiled by
    the user's cycle_length_days. Days before the person's first-ever
    logged period are left blank, not guessed.
    """

    cycle_profile, _ = CycleProfile.objects.get_or_create(user=user)
    cycle_length = cycle_profile.cycle_length_days

    logs = list(
        PeriodLog.objects.filter(user=user).order_by("start_date")
    )

    if not logs:
        return {
            "year": year,
            "cycle_length": cycle_length,
            "days": [],
        }

    today = date.today()
    current = date(year, 1, 1)
    end_of_year = date(year, 12, 31)

    days: list[CalendarDay] = []
    log_index = 0
    governing_log: PeriodLog | None = None

    # Two pointers walking forward together — both `current` (the day
    # we're labeling) and `logs` (sorted ascending) only ever move
    # forward, so this is one pass over the year, not one search per
    # day.
    while current <= end_of_year:
        while (
            log_index < len(logs)
            and logs[log_index].start_date <= current
        ):
            governing_log = logs[log_index]
            log_index += 1

        days.append(
            _build_day_entry(
                current, governing_log, cycle_length, today
            )
        )
        current += timedelta(days=1)

    return {
        "year": year,
        "cycle_length": cycle_length,
        "days": days,
    }