import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function AppNavigator() {
  const { isDark } = useTheme();
  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Without this, the native stack's own container
          // shows through (usually white / black) for a frame
          // during push/pop transitions — that's the "flash"
          // on back navigation. Matching it to the app
          // background makes the transition invisible.
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}