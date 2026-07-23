// Destination: src/services/registrationService.ts
//
// Just the HTTP call + token persistence — validation error MESSAGES are
// the backend's job (COPPA wording, password rules, etc. all come back
// as real strings from Django, not re-implemented here), and deciding
// what to do with a success/failure is the screen's job. This file only
// owns "make the request, save the tokens if it worked."

import type { RegisterRequest, RegisterResponse, RegistrationErrorResponse } from "@/types/auth";
import { API_BASE_URL } from "@/utils/getApiBaseUrl";
import { saveTokens } from "@/utils/tokenStorage";

export class RegistrationError extends Error {
  fieldErrors: RegistrationErrorResponse;

  constructor(fieldErrors: RegistrationErrorResponse) {
    // First available message, just for a sane default Error.message —
    // callers should read fieldErrors directly to show errors per-field.
    const firstMessage =
      fieldErrors.date_of_birth?.[0] ??
      fieldErrors.email?.[0] ??
      fieldErrors.password?.[0] ??
      fieldErrors.detail ??
      "Registration failed.";
    super(firstMessage);
    this.fieldErrors = fieldErrors;
  }
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new RegistrationError(data as RegistrationErrorResponse);
  }

  const result = data as RegisterResponse;
  await saveTokens(result.access, result.refresh);
  return result;
}
