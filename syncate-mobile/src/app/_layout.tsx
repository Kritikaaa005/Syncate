import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { PeriodSyncCoordinator } from "@/components/system/PeriodSyncCoordinator";

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
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PeriodSyncCoordinator />
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
