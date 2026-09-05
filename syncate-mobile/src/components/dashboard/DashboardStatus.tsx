import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

type DashboardLoadingProps = {
  message?: string;
};

function DashboardLoading({
  message = "Loading your dashboard...",
}: DashboardLoadingProps) {
  const { colors: theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ActivityIndicator
        size="large"
        color={theme.primary}
      />

      <Text
        style={[
          styles.loadingText,
          {
            color: theme.muted,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

type DashboardErrorProps = {
  message: string;
  onRetry: () => void;
};

function DashboardError({
  message,
  onRetry,
}: DashboardErrorProps) {
  const { colors: theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.errorTitle,
          {
            color: theme.text,
          },
        ]}
      >
        Couldn’t load your dashboard
      </Text>

      <Text
        style={[
          styles.errorMessage,
          {
            color: theme.muted,
          },
        ]}
      >
        {message}
      </Text>

      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading dashboard"
        style={({ pressed }) => [
          styles.retryButton,
          {
            backgroundColor:
              theme.primaryButton,
          },
          pressed &&
            styles.retryButtonPressed,
        ]}
      >
        <Text style={styles.retryText}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  errorTitle: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.25,
  },

  errorMessage: {
    maxWidth: 300,
    marginBottom: 22,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  retryButton: {
    minHeight: 48,
    paddingHorizontal: 26,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
});

export {
  DashboardError,
  DashboardLoading,
};
