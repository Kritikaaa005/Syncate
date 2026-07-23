// Destination: src/app/index.tsx
//
// Owns entry-point navigation timing only — how long the splash shows
// and where it goes next. Rendering the splash itself is SplashScreen's
// job; this file doesn't know how the splash looks.

import { useRouter } from "expo-router";
import { useEffect } from "react";

import SplashScreen from "@/screens/common/SplashScreen";

const SPLASH_DURATION_MS = 2000;

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: point to /terms once the Terms & Privacy screen route exists.
      router.replace("/guest");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}