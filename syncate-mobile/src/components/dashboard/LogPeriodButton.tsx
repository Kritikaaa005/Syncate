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
          backgroundColor: theme.card,
          borderColor: theme.primary,
        },
        pressed &&
          !disabled &&
          styles.buttonPressed,
        disabled &&
          styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.primary,
          },
        ]}
      >
        Log period
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 52,
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.45,
  },
});

export default LogPeriodButton;