import { Heart, Moon, Sun } from "lucide-react-native";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

function GuestLandingHeader() {
  const { isDark, toggleDark } = useTheme();

  const accentColor = isDark
    ? "rgba(255,124,163,0.9)"
    : "rgba(242,56,106,0.9)";

  const heartColor = isDark
    ? "rgba(255,124,163,0.8)"
    : "rgba(242,56,106,0.8)";

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

      <Pressable
        onPress={toggleDark}
        accessibilityRole="button"
        accessibilityLabel="Toggle dark mode"
        style={({ pressed }) => [
          styles.toggleButton,
          {
            borderColor: isDark ? "#FFFFFF" : "#F4467A",
          },
          pressed && styles.pressed,
        ]}
      >
        {isDark ? (
          <Sun size={18} color="#FFFFFF" />
        ) : (
          <Moon size={18} color="#F2386A" />
        )}
      </Pressable>
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

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export default GuestLandingHeader;