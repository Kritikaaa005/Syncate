// Destination: src/utils/authenticatedFetch.ts
//
// The one place that knows HOW to attach a token to a request — anything
// that needs to call an authenticated endpoint imports this instead of
// reaching for the access token itself and building headers by hand.
//
// KNOWN GAP: doesn't retry on a 401 by refreshing the access token first
// — every current caller (the registered-terms acceptance flow) runs
// right after registration/login, when the access token is at most a few
// seconds old, so this hasn't mattered yet. Whichever screen first needs
// to call an authenticated endpoint long after login (e.g. a Settings
// screen) should add refresh-and-retry here rather than each caller
// growing its own copy.

import { API_BASE_URL } from "./getApiBaseUrl";
import { getAccessToken } from "./tokenStorage";

export async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
