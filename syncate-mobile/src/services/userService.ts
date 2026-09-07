import type {
  EmailUpdateResponse,
  SetPasswordResponse,
  UserProfileSummary,
} from "@/types/profile";
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
  tracking_mode: TrackingMode | "";
  tracking_mode_label: string;
  message?: string;
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

async function authenticatedJson<T>(
  path: string,
  init?: RequestInit
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
          ...init,
          headers: {
            Accept: "application/json",
            ...(init?.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),
            ...init?.headers,
          },
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

function authenticatedPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  return authenticatedJson<T>(
    path,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

export function getMyProfile(): Promise<UserProfileSummary> {
  return authenticatedJson<UserProfileSummary>(
    "/users/me/profile/"
  );
}

export function addOrResendEmail(
  email: string
): Promise<EmailUpdateResponse> {
  return authenticatedPatch<EmailUpdateResponse>(
    "/users/me/email/",
    {
      email,
    }
  );
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

// === NEW: for ProfilePasswordScreen. `currentPassword` is only
// meaningful (and only sent) when the account already has a usable
// password — see SetPasswordSerializer on the backend for why it's
// the server, not this function's caller, that ultimately decides
// whether it's required.
export type SetPasswordPayload = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

export function setAccountPassword(
  payload: SetPasswordPayload
): Promise<SetPasswordResponse> {
  return authenticatedPatch<SetPasswordResponse>(
    "/users/me/password/",
    {
      current_password: payload.currentPassword ?? "",
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    }
  );
}

export async function getTrackingMode(): Promise<TrackingModeResponse> {
  return authenticatedJson<TrackingModeResponse>(
    "/users/me/tracking-mode/",
    {
      method: "GET",
    }
  );
}


export async function deactivateAccount(): Promise<void> {
  await authenticatedJson<unknown>(
    "/users/me/account/",
    {
      method: "DELETE",
    }
  );
}


async function authenticatedAccountRequest(
  path: string,
  method: "POST" | "DELETE"
): Promise<Response> {
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
          method,
          signal: controller.signal,
        }
      );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response)
      );
    }

    return response;

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


export async function scheduleAccountDeletion(): Promise<{
  deletion_due_at: string;
}> {
  const response =
    await authenticatedAccountRequest(
      "/users/me/account/schedule-deletion/",
      "POST"
    );

  return (
    await response.json()
  ) as {
    deletion_due_at: string;
  };
}


export async function permanentlyDeleteAccount(): Promise<void> {
  await authenticatedAccountRequest(
    "/users/me/account/permanent/",
    "DELETE"
  );
}