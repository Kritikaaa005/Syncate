// LOCATION: syncate-mobile/src/app/_layout.tsx
//
// The global brand header now participates in normal layout flow.
// It no longer sits absolutely on top of dashboard/guest content.

import {
  Stack,
  usePathname,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import GlobalBrandHeader from "@/components/system/GlobalBrandHeader";
import { PeriodSyncCoordinator } from "@/components/system/PeriodSyncCoordinator";
import { LanguageProvider } from "@/contexts/LanguageContext";
import {
  ThemeProvider,
  useTheme,
} from "@/contexts/ThemeContext";

function AppNavigator() {
  const pathname = usePathname();

  const {
    isDark,
    colors,
  } = useTheme();

  // Splash keeps the full centered logo and should not also show a header.
  const hideGlobalHeader =
    pathname === "/";

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          isDark ? "light" : "dark"
        }
      />

      {!hideGlobalHeader ? (
        <SafeAreaView
          edges={["top"]}
          style={{
            backgroundColor:
              colors.background,
          }}
        >
          <GlobalBrandHeader />
        </SafeAreaView>
      ) : null}

      <View style={styles.navigator}>
        <Stack
          screenOptions={{
            headerShown: false,

            contentStyle: {
              backgroundColor:
                colors.background,
            },
          }}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <PeriodSyncCoordinator />
          <AppNavigator />
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  navigator: {
    flex: 1,
  },
});
