import { API_BASE_URL } from "./getApiBaseUrl";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

type RefreshTokenResponse = {
  access: string;
  refresh?: string;
};

let activeRefreshRequest:
  Promise<string | null> | null = null;

function buildHeaders(
  originalHeaders: HeadersInit | undefined,
  accessToken: string | null
): Headers {
  const headers = new Headers(originalHeaders);

  if (!headers.has("Accept")) {
    headers.set(
      "Accept",
      "application/json"
    );
  }

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  } else {
    headers.delete("Authorization");
  }

  return headers;
}

function isRefreshResponse(
  value: unknown
): value is RefreshTokenResponse {
  if (
    !value
    || typeof value !== "object"
  ) {
    return false;
  }

  const data = value as Record<
    string,
    unknown
  >;

  return typeof data.access === "string";
}

async function refreshAccessToken():
  Promise<string | null> {
  const storedRefreshToken =
    await getRefreshToken();

  if (!storedRefreshToken) {
    await clearTokens();
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/token/refresh/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          refresh: storedRefreshToken,
        }),
      }
    );

    if (!response.ok) {
      await clearTokens();
      return null;
    }

    const data =
      (await response.json()) as unknown;

    if (!isRefreshResponse(data)) {
      await clearTokens();
      return null;
    }

    /*
     * Refresh-token rotation may return a new refresh
     * token. When it does not, preserve the existing one.
     */
    await saveTokens(
      data.access,
      data.refresh ?? storedRefreshToken
    );

    return data.access;
  } catch {
    /*
     * A network failure does not necessarily mean the
     * refresh token is invalid, so leave stored tokens
     * untouched and allow the caller to handle the 401.
     */
    return null;
  }
}

async function getFreshAccessToken():
  Promise<string | null> {
  if (!activeRefreshRequest) {
    activeRefreshRequest =
      refreshAccessToken().finally(() => {
        activeRefreshRequest = null;
      });
  }

  return activeRefreshRequest;
}

async function makeRequest(
  path: string,
  init: RequestInit,
  accessToken: string | null
): Promise<Response> {
  return fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers: buildHeaders(
        init.headers,
        accessToken
      ),
    }
  );
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const accessToken =
    await getAccessToken();

  const firstResponse =
    await makeRequest(
      path,
      init,
      accessToken
    );

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const refreshedAccessToken =
    await getFreshAccessToken();

  if (!refreshedAccessToken) {
    return firstResponse;
  }

  return makeRequest(
    path,
    init,
    refreshedAccessToken
  );
}