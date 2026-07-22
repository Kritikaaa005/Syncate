import { getAccessToken } from "@/services/tokenService";

const DEFAULT_API_URL = "http://127.0.0.1:8000/api";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL
).replace(/\/$/, "");

export type TrackingMode = "period" | "pregnancy";

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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as Record<string, unknown>;

    if (typeof data.detail === "string") {
      return data.detail;
    }

    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) &&
        typeof value[0] === "string"
      ) {
        return value[0];
      }

      if (typeof value === "string") {
        return value;
      }
    }
  } catch {
    // The backend response was not JSON.
  }

  return `Request failed with status ${response.status}.`;
}

async function authenticatedPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "No access token was found. Please sign in again."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The request took too long. Please try again."
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
  return authenticatedPatch<NicknameResponse>(
    "/users/me/nickname/",
    { nickname }
  );
}

export function updateTrackingMode(
  trackingMode: TrackingMode
): Promise<TrackingModeResponse> {
  return authenticatedPatch<TrackingModeResponse>(
    "/users/me/tracking-mode/",
    {
      tracking_mode: trackingMode,
    }
  );
}