import {
  authenticatedFetch,
} from "@/utils/authenticatedFetch";

const TRACKING_LOG_RANGE_ENDPOINT =
  "/tracking/me/logs/";

function logDetailEndpoint(
  logDate: string
): string {
  return `/tracking/me/logs/${logDate}/`;
}

export type DailyLogResponse = {
  log_date: string;

  data:
    Record<string, unknown>;

  created_at:
    string | null;

  updated_at:
    string | null;

  message?: string;
};

export type SaveDailyLogPayload = {
  data:
    Record<string, unknown>;
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

export async function getDailyLog(
  logDate: string
): Promise<DailyLogResponse> {
  const response =
    await authenticatedFetch(
      logDetailEndpoint(logDate),
      {
        method: "GET",
      }
    );

  return readResponse<DailyLogResponse>(
    response,
    "Could not load this day's log."
  );
}

export async function saveDailyLog(
  logDate: string,
  payload: SaveDailyLogPayload
): Promise<DailyLogResponse> {
  const response =
    await authenticatedFetch(
      logDetailEndpoint(logDate),
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  return readResponse<DailyLogResponse>(
    response,
    "Could not save this day's log."
  );
}

export async function getDailyLogsInRange(
  startDate: string,
  endDate: string
): Promise<DailyLogResponse[]> {
  const response =
    await authenticatedFetch(
      `${TRACKING_LOG_RANGE_ENDPOINT}?start=${startDate}&end=${endDate}`,
      {
        method: "GET",
      }
    );

  return readResponse<DailyLogResponse[]>(
    response,
    "Could not load your logs for this range."
  );
}