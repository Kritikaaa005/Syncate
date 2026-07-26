import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Globe, Languages } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function LanguageSelectScreen() {
  const { isDark } = useTheme();
  const { setLanguage } = useLanguage();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const handleLanguageSelect = async (lang: "en" | "ne") => {
    try {
      await setLanguage(lang);
      await AsyncStorage.setItem("app_language", lang);
      router.replace("/guest");
    } catch (error) {
      console.error("Failed to set language:", error);
      router.replace("/guest");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <Globe
              size={36}
              color={theme.primary}
              strokeWidth={1.8}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Choose your language
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.muted,
              },
            ]}
          >
            भाषा छान्नुहोस्
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Pressable
            onPress={() => handleLanguageSelect("en")}
            accessibilityRole="button"
            accessibilityLabel="Continue in English"
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.optionTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                English
              </Text>
              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                Continue in English
              </Text>
            </View>
            <Languages size={24} color={theme.primary} />
          </Pressable>

          <Pressable
            onPress={() => handleLanguageSelect("ne")}
            accessibilityRole="button"
            accessibilityLabel="नेपालीमा जारी राख्नुहोस्"
            style={({ pressed }) => [
              styles.optionCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.optionTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                नेपाली
              </Text>
              <Text
                style={[
                  styles.optionSubtitle,
                  {
                    color: theme.muted,
                  },
                ]}
              >
                नेपालीमा जारी राख्नुहोस्
              </Text>
            </View>
            <Languages size={24} color={theme.primary} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: theme.muted,
              },
            ]}
          >
            You can change this setting at any time.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  header: {
    alignItems: "center",
    marginTop: 80,
  },

  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
    textAlign: "center",
  },

  optionsContainer: {
    width: "100%",
    gap: 18,
    marginVertical: 40,
  },

  optionCard: {
    width: "100%",
    minHeight: 90,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  cardContent: {
    flex: 1,
    marginRight: 16,
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  optionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    alignItems: "center",
    marginBottom: 30,
  },

  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
