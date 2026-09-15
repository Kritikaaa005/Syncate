// LOCATION: syncate-mobile/src/components/system/GlobalBrandHeader.tsx
//
// App-wide header using plain text branding instead of an image.
// This makes the "syncate" wordmark blend naturally with the rest of the UI.

import { router, usePathname } from "expo-router";
import { Moon, Sun } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export const GLOBAL_BRAND_HEADER_HEIGHT = 48;

export default function GlobalBrandHeader() {
  const pathname = usePathname();

  const {
    isDark,
    toggleDark,
    colors,
  } = useTheme();

  const {
    language,
    setLanguage,
  } = useLanguage();

  const showSignIn =
    pathname.startsWith("/guest") ||
    pathname === "/terms";

  return (
    <View
      style={[
        styles.header,
        {
          height: GLOBAL_BRAND_HEADER_HEIGHT,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.brandText,
          {
            color: colors.primary,
          },
        ]}
      >
        syncate
      </Text>

      <View style={styles.actions}>
        {showSignIn ? (
          <Pressable
            onPress={() => router.push("/login")}
            accessibilityRole="button"
            accessibilityLabel={
              language === "ne"
                ? "लग इन गर्नुहोस्"
                : "Sign in"
            }
            hitSlop={8}
            style={({ pressed }) => [
              styles.textAction,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.signInText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {language === "ne"
                ? "लग इन"
                : "Sign in"}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.languageRow}>
          <Pressable
            onPress={() => setLanguage("en")}
            accessibilityRole="button"
            accessibilityLabel="Use English"
            accessibilityState={{
              selected: language === "en",
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.languageOption,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color:
                    language === "en"
                      ? colors.primary
                      : colors.muted,
                  fontWeight:
                    language === "en"
                      ? "800"
                      : "600",
                },
              ]}
            >
              EN
            </Text>

            <View
              style={[
                styles.activeLine,
                {
                  backgroundColor:
                    language === "en"
                      ? colors.primary
                      : "transparent",
                },
              ]}
            />
          </Pressable>

          <Text
            style={[
              styles.languageDivider,
              {
                color: colors.border,
              },
            ]}
          >
            |
          </Text>

          <Pressable
            onPress={() => setLanguage("ne")}
            accessibilityRole="button"
            accessibilityLabel="नेपाली प्रयोग गर्नुहोस्"
            accessibilityState={{
              selected: language === "ne",
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.languageOption,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                {
                  color:
                    language === "ne"
                      ? colors.primary
                      : colors.muted,
                  fontWeight:
                    language === "ne"
                      ? "800"
                      : "600",
                },
              ]}
            >
              ने
            </Text>

            <View
              style={[
                styles.activeLine,
                {
                  backgroundColor:
                    language === "ne"
                      ? colors.primary
                      : "transparent",
                },
              ]}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={toggleDark}
          accessibilityRole="button"
          accessibilityLabel={
            isDark
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          hitSlop={8}
          style={({ pressed }) => [
            styles.themeButton,
            pressed && styles.pressed,
          ]}
        >
          {isDark ? (
            <Sun
              size={17}
              color={colors.primary}
              strokeWidth={2}
            />
          ) : (
            <Moon
              size={17}
              color={colors.primary}
              strokeWidth={2}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -1,
    textTransform: "lowercase",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  textAction: {
    minHeight: 30,
    justifyContent: "center",
  },

  signInText: {
    fontSize: 12.5,
    fontWeight: "700",
  },

  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  languageOption: {
    minWidth: 26,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  languageText: {
    fontSize: 10.5,
    lineHeight: 14,
  },

  languageDivider: {
    marginHorizontal: 1,
    fontSize: 11,
    opacity: 0.7,
  },

  activeLine: {
    width: 14,
    height: 2,
    borderRadius: 999,
    marginTop: 2,
  },

  themeButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.6,
  },
});
