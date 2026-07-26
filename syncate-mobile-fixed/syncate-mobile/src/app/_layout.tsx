import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { initI18n } from "@/i18n";

function AppNavigator() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .catch((err) => {
        console.error("Failed to initialize i18n:", err);
        setIsI18nInitialized(true);
      });
  }, []);

  if (!isI18nInitialized) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

