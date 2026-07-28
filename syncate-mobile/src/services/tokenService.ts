import {
  clearTokens,
  getAccessToken as getStoredAccessToken,
  getRefreshToken as getStoredRefreshToken,
  saveTokens,
} from "../utils/tokenStorage";

export type AuthTokens = {
  access: string;
  refresh?: string;
};

/**
 * Compatibility wrapper for older parts of the app.
 *
 * The actual storage logic now lives only in:
 * src/utils/tokenStorage.ts
 */
export async function saveAuthTokens({
  access,
  refresh,
}: AuthTokens): Promise<void> {
  if (!access) {
    throw new Error("An access token is required.");
  }

  /*
   * Some refresh responses may provide only a new access token.
   * In that case, preserve the refresh token already stored.
   */
  const refreshToken =
    refresh ?? (await getStoredRefreshToken());

  if (!refreshToken) {
    throw new Error(
      "A refresh token is required to create an authenticated session."
    );
  }

  await saveTokens(access, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return getStoredAccessToken();
}

export async function getRefreshToken(): Promise<string | null> {
  return getStoredRefreshToken();
}

export async function clearAuthTokens(): Promise<void> {
  await clearTokens();
}