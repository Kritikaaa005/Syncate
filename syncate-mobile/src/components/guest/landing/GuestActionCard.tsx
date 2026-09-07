import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { GuestAction } from "@/constants/guestLandingData";
import { useTheme } from "@/contexts/ThemeContext";

type GuestActionCardProps = {
  action: GuestAction;
};

function GuestActionCard({ action }: GuestActionCardProps) {
  const { isDark, colors } = useTheme();
  const Icon = action.icon;

  return (
    <Pressable
      onPress={() => router.push(action.to)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: isDark ? "#3A2A38" : "#E8EEF8",
          backgroundColor: isDark ? "#221A28" : "#FFFFFF",
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.primarySoft,
          },
        ]}
      >
        <Icon size={23} color={colors.primary} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: isDark ? "#F3EDF1" : "#1E1730",
          },
        ]}
      >
        {action.title}
      </Text>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />

      <Text
        style={[
          styles.description,
          {
            color: isDark ? "#B7ACB8" : "#8D8A99",
          },
        ]}
      >
        {action.description}
      </Text>

      <View
        style={[
          styles.button,
          {
            backgroundColor: colors.primaryButton,
          },
        ]}
      >
        <Text style={styles.buttonText}>{action.buttonText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },

  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },

  iconCircle: {
    marginBottom: 13,
    height: 54,
    width: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginBottom: 7,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
  },

  divider: {
    marginBottom: 11,
    height: 3,
    width: 44,
    borderRadius: 999,
  },

  description: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 15,
    textAlign: "center",
    fontSize: 12.5,
    lineHeight: 18,
  },

  button: {
    minHeight: 40,
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "600",
  },
});

export default GuestActionCard;