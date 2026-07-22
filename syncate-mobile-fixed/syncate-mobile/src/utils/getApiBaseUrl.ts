// Destination: src/utils/getApiBaseUrl.ts
//
// Why this exists: EXPO_PUBLIC_API_URL had to be manually flipped between
// 127.0.0.1 (web/emulator) and a LAN IP (physical phone) every time you
// switched testing targets — easy to forget, and the failure mode (silent
// fallback to placeholder content) looks like a data bug, not a config one.
//
// Fix: Expo's dev server already knows which host the current client
// connected through (Constants.expoConfig.hostUri) — reuse that host,
// just swap the Metro port for Django's port. Works automatically for
// web, emulator, and physical device without touching .env.
//
// EXPO_PUBLIC_API_URL is still honored if explicitly set, for cases this
// can't guess correctly (e.g. pointing at a deployed staging backend).

import Constants from "expo-constants";

const BACKEND_PORT = 8000;
const FALLBACK_URL = `http://127.0.0.1:${BACKEND_PORT}/api`;

function detectApiBaseUrl(): string {
  const explicitOverride = process.env.EXPO_PUBLIC_API_URL;
  if (explicitOverride) {
    return explicitOverride.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.5:8081"
  if (!hostUri) {
    return FALLBACK_URL;
  }

  const host = hostUri.split(":")[0];
  return `http://${host}:${BACKEND_PORT}/api`;
}

export const API_BASE_URL = detectApiBaseUrl();
