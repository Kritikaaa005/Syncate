import { Heart, Moon, Sun } from "lucide-react-native";
import { router } from "expo-router";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

function GuestLandingHeader() {
  const { isDark, toggleDark, colors } = useTheme();

  const accentColor = `${colors.primary}E6`;
  const heartColor = `${colors.secondary}CC`;

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Text
          style={[
            styles.brandText,
            {
              color: accentColor,
            },
          ]}
        >
          Syncate
        </Text>

        <Heart
          size={12}
          color={heartColor}
          fill={heartColor}
        />
      </View>

      <View style={styles.headerActions}>
        <Pressable onPress={() => router.push("/login")} accessibilityRole="button">
          <Text style={[styles.signIn, { color: colors.primary }]}>Sign in</Text>
        </Pressable>
      <Pressable
        onPress={toggleDark}
        accessibilityRole="button"
        accessibilityLabel="Toggle dark mode"
        style={({ pressed }) => [
          styles.toggleButton,
          {
            borderColor: isDark ? "#FFFFFF" : colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        {isDark ? (
          <Sun size={18} color="#FFFFFF" />
        ) : (
          <Moon size={18} color={colors.primary} />
        )}
      </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  brandText: {
    fontSize: 19,
    fontWeight: "400",
    fontStyle: "italic",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },

  toggleButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  signIn: { fontSize: 14, fontWeight: "700" },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export default GuestLandingHeader;
