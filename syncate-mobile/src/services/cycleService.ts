import {
  authenticatedFetch,
} from "@/utils/authenticatedFetch";

const LAST_PERIOD_ENDPOINT =
  "/cycle/me/last-period/";

export type LastPeriodStatus =
  | "not_provided"
  | "known"
  | "unknown";

export type DashboardState =
  | "known"
  | "unknown";

export type CyclePhaseKey =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal";

export type CyclePhaseResponse = {
  key: CyclePhaseKey;
  name: string;
  display_name: string;
  description: string;
};

export type LastPeriodResponse = {
  nickname: string;
  last_period_status:
    LastPeriodStatus;

  last_period_start_date:
    string | null;

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

  onboarding_completed?: boolean;
  message?: string;
};

export type SaveLastPeriodPayload = {
  last_period_status:
    "known" | "unknown";

  last_period_start_date:
    string | null;
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

export async function getLastPeriod():
  Promise<LastPeriodResponse> {
  const response =
    await authenticatedFetch(
      LAST_PERIOD_ENDPOINT,
      {
        method: "GET",
      }
    );

  return readResponse<LastPeriodResponse>(
    response,
    "Could not load your cycle information."
  );
}

export async function saveLastPeriod(
  payload: SaveLastPeriodPayload
): Promise<LastPeriodResponse> {
  const response =
    await authenticatedFetch(
      LAST_PERIOD_ENDPOINT,
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

  return readResponse<LastPeriodResponse>(
    response,
    "Could not save your period information."
  );
}