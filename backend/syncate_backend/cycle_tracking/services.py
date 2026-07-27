from datetime import date, timedelta
from typing import TypedDict


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


def get_cycle_phase(
    cycle_day: int,
) -> PhaseDetails:
    """
    Return an estimated cycle phase.

    These values are general estimates and must not
    be presented as medically exact predictions.
    """

    if cycle_day <= 5:
        return {
            "key": "menstrual",
            "name": "Menstrual Phase",
            "display_name": (
                "Likely Menstrual Phase"
            ),
            "description": (
                "Your period may be active, and your "
                "body may need extra rest and care."
            ),
        }

    if cycle_day <= 13:
        return {
            "key": "follicular",
            "name": "Follicular Phase",
            "display_name": (
                "Likely Follicular Phase"
            ),
            "description": (
                "Your body may be preparing for "
                "ovulation."
            ),
        }

    if cycle_day <= 16:
        return {
            "key": "ovulation",
            "name": "Ovulation Window",
            "display_name": (
                "Estimated Ovulation Window"
            ),
            "description": (
                "Ovulation may be approaching or "
                "happening around this time."
            ),
        }

    return {
        "key": "luteal",
        "name": "Luteal Phase",
        "display_name": (
            "Likely Luteal Phase"
        ),
        "description": (
            "Your body may be preparing for your "
            "next period."
        ),
    }


def calculate_cycle_dashboard(
    last_period_start_date: date,
    cycle_length: int = DEFAULT_CYCLE_LENGTH,
    today: date | None = None,
) -> CycleDashboardData:
    """
    Calculate the user's estimated dashboard data
    from their most recently recorded period date.

    A 28-day cycle is temporarily used until Syncate
    has enough period records to calculate the user's
    personal average cycle length.
    """

    current_date = today or date.today()

    if last_period_start_date > current_date:
        raise ValueError(
            "Last period start date cannot be "
            "in the future."
        )

    if cycle_length < 21 or cycle_length > 45:
        raise ValueError(
            "Cycle length must be between "
            "21 and 45 days."
        )

    elapsed_days = (
        current_date
        - last_period_start_date
    ).days

    completed_cycles = (
        elapsed_days // cycle_length
    )

    current_cycle_start_date = (
        last_period_start_date
        + timedelta(
            days=completed_cycles
            * cycle_length
        )
    )

    cycle_day = (
        current_date
        - current_cycle_start_date
    ).days + 1

    next_period_date = (
        current_cycle_start_date
        + timedelta(days=cycle_length)
    )

    estimated_ovulation_date = (
        current_cycle_start_date
        + timedelta(
            days=ESTIMATED_OVULATION_DAY - 1
        )
    )

    days_until_next_period = max(
        0,
        (
            next_period_date
            - current_date
        ).days,
    )

    days_until_ovulation = (
        estimated_ovulation_date
        - current_date
    ).days

    return {
        "cycle_day": cycle_day,
        "cycle_length": cycle_length,
        "phase": get_cycle_phase(
            cycle_day
        ),
        "current_cycle_start_date": (
            current_cycle_start_date
        ),
        "next_period_date": (
            next_period_date
        ),
        "estimated_ovulation_date": (
            estimated_ovulation_date
        ),
        "days_until_next_period": (
            days_until_next_period
        ),
        "days_until_ovulation": (
            days_until_ovulation
        ),
        "prediction_basis": (
            "default_28_day_cycle"
        ),
    }