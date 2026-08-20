// Destination: src/app/index.tsx
//
// Owns entry-point navigation timing only — how long the splash shows
// and where it goes next. Rendering the splash itself is SplashScreen's
// job; this file doesn't know how the splash looks.

import { useRouter } from "expo-router";
import { useEffect } from "react";

import SplashScreen from "@/screens/common/SplashScreen";
import { getAccessToken } from "@/utils/tokenStorage";
// If your project keeps it under components/common instead, adjust this import.

const SPLASH_DURATION_MS = 2000;

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      // A saved access token means this device already has an account —
      // route straight to the personalized dashboard instead of back
      // through the guest/register flow on every cold start. This is
      // only checking "does a token exist", not validating it's
      // unexpired — an expired access token still refreshes fine via
      // the refresh token, and a dead refresh token just means the
      // dashboard's own data fetch will hit a 401 and can bounce back
      // to /terms then. That retry path isn't wired up yet — flagging
      // it here as a known gap rather than solving it in this file,
      // which only owns launch timing.
      const token = await getAccessToken();
      if (!active) return;

      router.replace(token ? "/dashboard" : "/terms");
    }, SPLASH_DURATION_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router]);

  return <SplashScreen />;
}