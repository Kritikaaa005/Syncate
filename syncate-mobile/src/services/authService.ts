import { API_BASE_URL } from "@/utils/getApiBaseUrl";
import { saveTokens } from "@/utils/tokenStorage";
import { triggerAutomaticPeriodSync } from "@/services/periodSyncService";

type TokenResponse = { access: string; refresh: string };

export class ScheduledDeletionLoginError extends Error {
  constructor(public deletionDueAt: string) {
    super("This account is scheduled for deletion.");
  }
}

async function credentialRequest(path: string, email: string, password: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    if (data.code === "ACCOUNT_SCHEDULED_FOR_DELETION" && typeof data.deletion_due_at === "string") {
      throw new ScheduledDeletionLoginError(data.deletion_due_at);
    }
    throw new Error(typeof data.detail === "string" ? data.detail : "Sign in failed.");
  }
  const tokens = data as TokenResponse;
  await saveTokens(tokens.access, tokens.refresh);
  void triggerAutomaticPeriodSync();
  return tokens;
}

export function login(email: string, password: string) {
  return credentialRequest("/auth/login/", email, password);
}

export function restoreScheduledAccount(email: string, password: string) {
  return credentialRequest("/auth/restore-account/", email, password);
}
