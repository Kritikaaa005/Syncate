import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import SplashScreen from "@/screens/common/SplashScreen";

const SPLASH_DURATION_MS = 2000;

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        //commented out for testing purpose
        
        // const savedLanguage = await AsyncStorage.getItem("app_language");
        // if (!active) return;

        // if (savedLanguage) {
        //   router.replace("/guest");
        // } else {
        //   router.replace("/language-select");
        // }

        if (!active) return;
        router.replace("/language-select");

      } catch (error) {
        console.error("Error reading saved language:", error);
        if (active) {
          router.replace("/language-select");
        }
      }
    }, SPLASH_DURATION_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [router]);

  return <SplashScreen />;
}
