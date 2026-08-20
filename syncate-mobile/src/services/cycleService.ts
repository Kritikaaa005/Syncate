// LOCATION: syncate-mobile/src/services/cycleService.ts
// (replaces the existing file)
//
// The backend used to have ONE endpoint (/cycle/me/last-period/) that did
// everything — save the last period AND return the whole dashboard. It's
// now split to match the backend split: one endpoint to log a period,
// one to read the dashboard. last_period_status is gone entirely —
// there's no more "unknown" status to save, because the backend can't
// store a period with no date. If someone says "idk" now, we just don't
// call the API at all (see LastPeriodScreen.tsx) and let the dashboard
// naturally show its empty state.

import {
  authenticatedFetch,
} from "@/utils/authenticatedFetch";
import type { CyclePhaseKey } from "@/constants/guestTheme";

const PERIODS_ENDPOINT =
  "/cycle/me/periods/";

const DASHBOARD_ENDPOINT =
  "/cycle/me/dashboard/";

// === NEW: for the cycle-length / period-duration onboarding
// questions (CyclePreferencesScreen.tsx). Separate endpoint from
// periods/dashboard on purpose — this is "what we should ASSUME"
// (a default), not "what actually happened" (a logged period).
const PROFILE_ENDPOINT =
  "/cycle/me/profile/";

// === NEW: for the year-long calendar view.
const CALENDAR_ENDPOINT =
  "/cycle/me/calendar/";

// === CHANGED: "unknown" -> "awaiting_first_period", matching the
// backend's dashboard_state field exactly. Renamed instead of just
// remapped so a search for "awaiting_first_period" in this codebase
// actually finds every place that cares about it.
export type DashboardState =
  | "known"
  | "awaiting_first_period";

// === CHANGED: this used to be defined locally here. Moved to
// guestTheme.ts and imported instead, so the calendar's phase colors
// and the dashboard's phase key are guaranteed to be talking about
// the same four values — one definition, not two that could drift
// apart.
export type { CyclePhaseKey };

export type CyclePhaseResponse = {
  key: CyclePhaseKey;
  name: string;
  display_name: string;
  description: string;
  article_slug: string | null;
};

// === CHANGED: this used to be called LastPeriodResponse and also
// carried last_period_status / last_period_start_date, since one
// endpoint did double duty. Now it's just what GET /me/dashboard/
// actually returns.
export type DashboardResponse = {
  nickname: string;

  dashboard_state:
    DashboardState;

  cycle_day:
    number | null;

  cycle_length:
    number | null;

  phase:
    CyclePhaseResponse | null;

  current_cycle_start_date:
    string | null;

  next_period_date:
    string | null;

  estimated_ovulation_date:
    string | null;

  days_until_next_period:
    number | null;

  days_until_ovulation:
    number | null;

  prediction_basis:
    string | null;
};

// What POST /me/periods/ hands back — a single logged period, not the
// whole dashboard. If the caller wants the updated dashboard after
// logging, call getDashboard() separately (see LastPeriodScreen.tsx /
// DashboardCalendarScreen.tsx for that pattern).
export type PeriodLogResponse = {
  id: number;
  start_date: string;
  end_date: string | null;
  date_confidence: "exact" | "estimated";
  created_at: string;
  onboarding_completed?: boolean;
  message?: string;
};

// end_date is optional here on purpose — same reasoning as the backend
// model. Day 1 of a period, you don't know the last day yet.
export type LogPeriodPayload = {
  start_date: string;
  end_date?: string | null;
};

// === NEW: matches CycleProfile.EstimateConfidence on the backend.
// "exact" isn't used by the onboarding screen right now (we only offer
// buckets or idk, no free-typed number) but it's here so the type
// matches the backend contract exactly — if a "type your own number"
// option gets added later, it slots in without a type change.
export type EstimateConfidence =
  | "exact"
  | "estimated"
  | "unknown";

// Both pairs are optional on the payload — PATCH is partial, so
// sending just the cycle-length pair (without touching period-length)
// is valid too. The screen we're building always sends both together,
// but the type doesn't force that.
export type CyclePreferencesPayload = {
  cycle_length_days?: number;
  cycle_length_confidence?: EstimateConfidence;
  period_length_days?: number;
  period_length_confidence?: EstimateConfidence;
};

export type CycleProfileResponse = {
  cycle_length_days: number;
  cycle_length_confidence: EstimateConfidence;
  period_length_days: number;
  period_length_confidence: EstimateConfidence;
};

// === NEW: matches CalendarDay on the backend (services.py). "phase"
// is null for the "none" source — days before the person's very
// first logged period, where there's genuinely nothing to estimate
// from.
export type CalendarDaySource =
  | "logged"
  | "estimated"
  | "none";

export type CalendarDay = {
  date: string;
  phase: CyclePhaseKey | null;
  source: CalendarDaySource;
  is_today: boolean;
};

export type CalendarResponse = {
  year: number;
  cycle_length: number;
  days: CalendarDay[];
};

type ApiErrorData = {
  detail?: string;
  message?: string;
  [key: string]: unknown;
};

function getErrorMessage(
  data: ApiErrorData | null,
  fallback: string
): string {
  if (!data) {
    return fallback;
  }

  if (
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    typeof data.message === "string"
  ) {
    return data.message;
  }

  for (
    const value
    of Object.values(data)
  ) {
    if (
      typeof value === "string"
    ) {
      return value;
    }

    if (
      Array.isArray(value)
      && typeof value[0] === "string"
    ) {
      return value[0];
    }
  }

  return fallback;
}

async function readResponse<T>(
  response: Response,
  fallbackError: string
): Promise<T> {
  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data as ApiErrorData | null,
        fallbackError
      )
    );
  }

  return data as T;
}

export async function getDashboard():
  Promise<DashboardResponse> {
  const response =
    await authenticatedFetch(
      DASHBOARD_ENDPOINT,
      {
        method: "GET",
      }
    );

  return readResponse<DashboardResponse>(
    response,
    "Could not load your cycle information."
  );
}

export async function getPeriodLogs():
  Promise<PeriodLogResponse[]> {
  const response =
    await authenticatedFetch(
      PERIODS_ENDPOINT,
      {
        method: "GET",
      }
    );

  return readResponse<PeriodLogResponse[]>(
    response,
    "Could not load your period history."
  );
}

export async function logPeriod(
  payload: LogPeriodPayload
): Promise<PeriodLogResponse> {
  const response =
    await authenticatedFetch(
      PERIODS_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  return readResponse<PeriodLogResponse>(
    response,
    "Could not save your period information."
  );
}

// === NEW: saves the cycle-length / period-duration onboarding
// answers. Called once, from CyclePreferencesScreen.tsx, right after
// LastPeriodScreen — this is the last step of period-tracking
// onboarding.
export async function updateCyclePreferences(
  payload: CyclePreferencesPayload
): Promise<CycleProfileResponse> {
  const response =
    await authenticatedFetch(
      PROFILE_ENDPOINT,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  return readResponse<CycleProfileResponse>(
    response,
    "Could not save your cycle preferences."
  );
}

// === NEW: fetches every day of `year` labeled with a phase, for the
// calendar screen. Defaults to the current year on the backend if
// `year` isn't passed.
export async function getCalendar(
  year?: number
): Promise<CalendarResponse> {
  const url =
    year !== undefined
      ? `${CALENDAR_ENDPOINT}?year=${year}`
      : CALENDAR_ENDPOINT;

  const response =
    await authenticatedFetch(url, {
      method: "GET",
    });

  return readResponse<CalendarResponse>(
    response,
    "Could not load your calendar."
  );
}

// === NEW: was never wired to anything on the frontend even though
// the backend's had PATCH/DELETE on a single period since the
// PeriodLogDetailView work earlier. Used by the calendar
// screen's inline edit flow.
export async function updatePeriod(
  id: number,
  payload: LogPeriodPayload
): Promise<PeriodLogResponse> {
  const response =
    await authenticatedFetch(
      `${PERIODS_ENDPOINT}${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  return readResponse<PeriodLogResponse>(
    response,
    "Could not update that period."
  );
}

export async function deletePeriod(
  id: number
): Promise<void> {
  const response =
    await authenticatedFetch(
      `${PERIODS_ENDPOINT}${id}/`,
      {
        method: "DELETE",
      }
    );

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    throw new Error(
      getErrorMessage(
        data as ApiErrorData | null,
        "Could not delete that period."
      )
    );
  }
}