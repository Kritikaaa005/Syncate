import { CalendarDays } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

type LogPeriodButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

function LogPeriodButton({
  onPress,
  disabled = false,
}: LogPeriodButtonProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Log period"
      accessibilityState={{
        disabled,
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            theme.primaryButton,
          shadowColor:
            theme.shadow,
        },
        pressed &&
          !disabled &&
          styles.buttonPressed,
        disabled &&
          styles.buttonDisabled,
      ]}
    >
      <CalendarDays
        size={20}
        strokeWidth={2}
        color="#FFFFFF"
      />

      <Text style={styles.label}>
        Log Period
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 54,
    marginTop: 20,
    paddingHorizontal: 22,
    borderRadius: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
});

export default LogPeriodButton;