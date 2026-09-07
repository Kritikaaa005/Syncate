import { getAccessToken } from "./tokenStorage";

type JwtPayload = {
  user_id?: unknown;
};

function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split(".");

  if (parts.length !== 3 || !parts[1]) {
    throw new Error("The stored access token is malformed.");
  }

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  try {
    const payload = JSON.parse(atob(paddedBase64)) as unknown;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("The stored access token payload is invalid.");
    }

    return payload as JwtPayload;
  } catch (error) {
    if (error instanceof Error && error.message === "The stored access token payload is invalid.") {
      throw error;
    }

    throw new Error("The stored access token payload could not be decoded.");
  }
}

export async function getCurrentUserId(): Promise<string> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("No authenticated user is available.");
  }

  const { user_id: userId } = decodeJwtPayload(accessToken);

  if (
    (typeof userId !== "string" && typeof userId !== "number") ||
    String(userId).trim().length === 0
  ) {
    throw new Error("The stored access token does not contain a valid user ID.");
  }

  return String(userId);
}
