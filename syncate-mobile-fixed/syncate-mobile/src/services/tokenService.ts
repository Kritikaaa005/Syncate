import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "syncate-access-token";
const REFRESH_TOKEN_KEY = "syncate-refresh-token";

export type AuthTokens = {
  access: string;
  refresh?: string;
};

export async function saveAuthTokens({
  access,
  refresh,
}: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);

  if (refresh) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } else {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens(): Promise<void> {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
}