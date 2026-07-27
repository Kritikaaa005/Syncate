import {
  BarChart3,
  CalendarDays,
  Home,
  Plus,
  UserRound,
} from "lucide-react-native";
import {
  type Href,
  router,
} from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";

type BottomNavItem =
  | "home"
  | "calendar"
  | "log"
  | "insights"
  | "profile";

type RegisteredBottomNavProps = {
  activeItem?: BottomNavItem;
};

const DASHBOARD_ROUTE =
  "/dashboard" as Href;

const CALENDAR_ROUTE =
  "/dashboard/calendar" as Href;

function RegisteredBottomNav({
  activeItem = "home",
}: RegisteredBottomNavProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const getItemColor = (
    item: BottomNavItem
  ) =>
    activeItem === item
      ? theme.primary
      : theme.muted;

  const showComingSoon = (
    feature: string
  ) => {
    Alert.alert(
      "Coming soon",
      `${feature} will be added later.`
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <Pressable
        onPress={() =>
          router.replace(DASHBOARD_ROUTE)
        }
        style={styles.navItem}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <Home
          size={22}
          strokeWidth={2}
          color={getItemColor("home")}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                getItemColor("home"),
            },
          ]}
        >
          Home
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push(CALENDAR_ROUTE)
        }
        style={styles.navItem}
        accessibilityRole="button"
        accessibilityLabel="Calendar"
      >
        <CalendarDays
          size={22}
          strokeWidth={1.9}
          color={getItemColor(
            "calendar"
          )}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                getItemColor(
                  "calendar"
                ),
            },
          ]}
        >
          Calendar
        </Text>
      </Pressable>

      <View style={styles.logContainer}>
        <Pressable
          onPress={() =>
            router.push(CALENDAR_ROUTE)
          }
          accessibilityRole="button"
          accessibilityLabel="Log period"
          style={({ pressed }) => [
            styles.logButton,
            {
              backgroundColor:
                theme.primaryButton,
              shadowColor: theme.shadow,
            },
            pressed &&
              styles.logButtonPressed,
          ]}
        >
          <Plus
            size={28}
            strokeWidth={2.2}
            color="#FFFFFF"
          />
        </Pressable>

        <Text
          style={[
            styles.label,
            {
              color:
                getItemColor("log"),
            },
          ]}
        >
          Log
        </Text>
      </View>

      <Pressable
        onPress={() =>
          showComingSoon("Insights")
        }
        style={styles.navItem}
        accessibilityRole="button"
        accessibilityLabel="Insights"
      >
        <BarChart3
          size={22}
          strokeWidth={1.9}
          color={getItemColor(
            "insights"
          )}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                getItemColor(
                  "insights"
                ),
            },
          ]}
        >
          Insights
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          showComingSoon("Profile")
        }
        style={styles.navItem}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <UserRound
          size={22}
          strokeWidth={1.9}
          color={getItemColor(
            "profile"
          )}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                getItemColor(
                  "profile"
                ),
            },
          ]}
        >
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 82,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",

    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 12,
  },

  navItem: {
    minWidth: 58,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  label: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "500",
  },

  logContainer: {
    minWidth: 62,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  logButton: {
    width: 54,
    height: 54,
    marginTop: -28,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",

    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.24,
    shadowRadius: 13,
    elevation: 8,
  },

  logButtonPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.95,
      },
    ],
  },
});

export default RegisteredBottomNav;