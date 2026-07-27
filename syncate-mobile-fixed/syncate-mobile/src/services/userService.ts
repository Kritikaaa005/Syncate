import { authenticatedFetch } from "@/utils/authenticatedFetch";

export type TrackingMode =
  | "period"
  | "pregnancy";

export type NicknameResponse = {
  profile_id: number;
  nickname: string;
  message: string;
};

export type TrackingModeResponse = {
  profile_id: number;
  nickname: string;
  tracking_mode: TrackingMode;
  tracking_mode_label: string;
  message: string;
};

function extractErrorMessage(
  value: unknown
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (
    value &&
    typeof value === "object"
  ) {
    for (
      const nestedValue
      of Object.values(value)
    ) {
      const message =
        extractErrorMessage(
          nestedValue
        );

      if (message) {
        return message;
      }
    }
  }

  return null;
}

async function getErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data =
      (await response.json()) as unknown;

    const message =
      extractErrorMessage(data);

    if (message) {
      return message;
    }
  } catch {
    // Response was not JSON.
  }

  if (response.status === 401) {
    return (
      "Your session has expired. "
      + "Please sign in again."
    );
  }

  return (
    `Request failed with status `
    + `${response.status}.`
  );
}

async function authenticatedPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    const response =
      await authenticatedFetch(
        path,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response
        )
      );
    }

    return (
      await response.json()
    ) as T;
  } catch (error) {
    if (
      error instanceof Error
      && error.name === "AbortError"
    ) {
      throw new Error(
        "The request took too long. "
        + "Please try again."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function updateNickname(
  nickname: string
): Promise<NicknameResponse> {
  return authenticatedPatch<
    NicknameResponse
  >(
    "/users/me/nickname/",
    {
      nickname,
    }
  );
}

export function updateTrackingMode(
  trackingMode: TrackingMode
): Promise<TrackingModeResponse> {
  return authenticatedPatch<
    TrackingModeResponse
  >(
    "/users/me/tracking-mode/",
    {
      tracking_mode: trackingMode,
    }
  );
}