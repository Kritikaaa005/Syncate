import { authenticatedFetch } from "@/utils/authenticatedFetch";
import { API_BASE_URL } from "@/utils/getApiBaseUrl";
import { saveTokens } from "@/utils/tokenStorage";

const PARTNER_CODE_ENDPOINT = "/users/partner/code/";
const VALIDATE_PARTNER_CODE_ENDPOINT = "/users/partner/validate-code/";
const REGISTER_PARTNER_ENDPOINT = "/users/partner/register/";

export type GeneratedPartnerCode = {
  code: string;
  expires_at: string;
  counter: number;
};

export type PartnerRegistrationPayload = {
  code: string;
  nickname: string;
  date_of_birth: string;
  email?: string;
  password?: string;
};

export type PartnerRegistrationResponse = {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    is_email_verified: boolean;
    email_verification_sent: boolean;
  };
};

type ApiErrorData = {
  detail?: unknown;
  message?: unknown;
  code?: unknown;
  nickname?: unknown;
  date_of_birth?: unknown;
  email?: unknown;
  password?: unknown;
};

export class PartnerServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors: ApiErrorData = {},
  ) {
    super(message);
  }
}

function firstError(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function throwPartnerError(response: Response, data: unknown, fallback: string): never {
  const errors = (data && typeof data === "object" ? data : {}) as ApiErrorData;
  const message =
    firstError(errors.detail) ||
    firstError(errors.message) ||
    firstError(errors.code) ||
    firstError(errors.nickname) ||
    firstError(errors.date_of_birth) ||
    firstError(errors.email) ||
    firstError(errors.password) ||
    fallback;

  throw new PartnerServiceError(message, response.status, errors);
}

function isGeneratedPartnerCode(value: unknown): value is GeneratedPartnerCode {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.code === "string" &&
    typeof data.expires_at === "string" &&
    typeof data.counter === "number"
  );
}

export async function generatePartnerCode(): Promise<GeneratedPartnerCode> {
  const response = await authenticatedFetch(PARTNER_CODE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await readJson(response);

  if (!response.ok) {
    throwPartnerError(response, data, "Could not generate a partner code.");
  }

  if (!isGeneratedPartnerCode(data)) {
    throw new Error("The partner code response was invalid.");
  }

  return data;
}

function isPartnerRegistrationResponse(value: unknown): value is PartnerRegistrationResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  const user = data.user as Record<string, unknown> | undefined;
  return (
    typeof data.access === "string" &&
    typeof data.refresh === "string" &&
    !!user &&
    typeof user.id === "number" &&
    typeof user.email === "string" &&
    typeof user.nickname === "string" &&
    typeof user.is_email_verified === "boolean" &&
    typeof user.email_verification_sent === "boolean"
  );
}

export async function validatePartnerCode(code: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${VALIDATE_PARTNER_CODE_ENDPOINT}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await readJson(response);

  if (!response.ok) {
    throwPartnerError(response, data, "This partner code is invalid or has expired.");
  }

  if (
    !data ||
    typeof data !== "object" ||
    (data as Record<string, unknown>).valid !== true
  ) {
    throw new Error("The partner code validation response was invalid.");
  }
}

export async function registerPartner(
  payload: PartnerRegistrationPayload,
): Promise<PartnerRegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}${REGISTER_PARTNER_ENDPOINT}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);

  if (!response.ok) {
    throwPartnerError(response, data, "Could not create your partner account.");
  }

  if (!isPartnerRegistrationResponse(data)) {
    throw new Error("The partner registration response was invalid.");
  }

  await saveTokens(data.access, data.refresh);
  return data;
}
