// Destination: src/utils/tokenStorage.ts
//
// Why expo-secure-store and not AsyncStorage: AsyncStorage is plain,
// unencrypted on-device storage — fine for UI preferences (see
// useGuestConsent.ts), not fine for something that IS the credential to
// someone's account. SecureStore wraps the iOS Keychain / Android
// Keystore, so the tokens are encrypted at rest by the OS itself, not
// just "another file an app with storage access could read."
//
// KNOWN GAP, now handled explicitly: expo-secure-store has no Keychain/
// Keystore to wrap on web — there's no OS-level secure storage in a
// browser. Calling SecureStore.setItemAsync() on web throws, which used
// to surface as a generic caught error two layers up (RegisterScreen's
// catch block), showing "Couldn't reach Syncate" even though the request
// had already succeeded. Native (iOS/Android) is unaffected and keeps
// using real SecureStore. Web falls back to AsyncStorage — NOT secure
// storage, just enough to keep local/web dev working — this is a
// deliberate, disclosed tradeoff, not a fix for web security. If/when
// this app ships a real web target, tokens on web need a proper story
// (e.g. httpOnly cookies from the backend) rather than this fallback.
//
// Kept as its own tiny file (not spread across registrationService.ts /
// authService.ts) so there's exactly one place that knows HOW tokens are
// stored — everything else just calls save/get/clear.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "syncate_access_token";
const REFRESH_TOKEN_KEY = "syncate_refresh_token";

const isWeb = Platform.OS === "web";

export async function saveTokens(access: string, refresh: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, access],
      [REFRESH_TOKEN_KEY, refresh],
    ]);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

export async function getAccessToken(): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(ACCESS_TOKEN_KEY) : SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(REFRESH_TOKEN_KEY) : SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  if (isWeb) {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
