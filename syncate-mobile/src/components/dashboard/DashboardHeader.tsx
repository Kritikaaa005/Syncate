import { Bell } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { getGreeting } from "@/utils/cycleCalculations";

type DashboardHeaderProps = {
  nickname: string;
  onNotificationsPress?: () => void;
  hasUnreadNotifications?: boolean;
};

function DashboardHeader({
  nickname,
  onNotificationsPress,
  hasUnreadNotifications = false,
}: DashboardHeaderProps) {
  const { colors: theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.greeting,
            {
              color: theme.text,
            },
          ]}
          numberOfLines={1}
        >
          {getGreeting()}, {nickname}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.muted,
            },
          ]}
        >
          Here’s your summary
        </Text>
      </View>

      <Pressable
        onPress={onNotificationsPress}
        disabled={!onNotificationsPress}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        style={({ pressed }) => [
          styles.notificationButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          pressed &&
            Boolean(onNotificationsPress) &&
            styles.notificationButtonPressed,
        ]}
      >
        <Bell
          size={22}
          strokeWidth={1.9}
          color={theme.muted}
        />

        {hasUnreadNotifications ? (
          <View
            style={[
              styles.notificationDot,
              {
                backgroundColor:
                  theme.primary,
                borderColor:
                  theme.card,
              },
            ]}
          />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  textContainer: {
    flex: 1,
    paddingRight: 16,
  },

  greeting: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.35,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },

  notificationButton: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
  },
});

export default DashboardHeader;
