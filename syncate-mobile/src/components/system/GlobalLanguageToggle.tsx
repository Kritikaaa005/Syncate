// LOCATION: syncate-mobile/src/components/system/GlobalLanguageToggle.tsx

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export function GlobalLanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          top: insets.top + 62,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Pressable
          onPress={() => setLanguage("en")}
          accessibilityRole="button"
          accessibilityLabel="Use English"
          accessibilityState={{ selected: language === "en" }}
          style={[
            styles.option,
            language === "en" && {
              backgroundColor: colors.primaryButton,
            },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              {
                color:
                  language === "en"
                    ? "#FFFFFF"
                    : colors.muted,
              },
            ]}
          >
            EN
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setLanguage("ne")}
          accessibilityRole="button"
          accessibilityLabel="नेपाली प्रयोग गर्नुहोस्"
          accessibilityState={{ selected: language === "ne" }}
          style={[
            styles.option,
            language === "ne" && {
              backgroundColor: colors.primaryButton,
            },
          ]}
        >
          <Text
            style={[
              styles.optionText,
              {
                color:
                  language === "ne"
                    ? "#FFFFFF"
                    : colors.muted,
              },
            ]}
          >
            ने
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    right: 12,
    zIndex: 9999,
    elevation: 40,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    padding: 3,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    minWidth: 34,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
});
