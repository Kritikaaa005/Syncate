import { type Href, router } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext"
import DashboardHeader from "./DashboardHeader";
import RegisteredBottomNav from "./RegisteredBottomNav";

const LAST_PERIOD_ROUTE =
  "/onboarding/last-period" as Href;

type UnknownCycleStateProps = {
  nickname: string;
};

function UnknownCycleState({
  nickname,
}: UnknownCycleStateProps) {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark
            ? theme.background
            : "#FFF1F5",
        },
      ]}
    >
      <View style={styles.content}>
        <DashboardHeader
          nickname={nickname}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  theme.primarySoft,
              },
            ]}
          >
            <CalendarDays
              size={30}
              strokeWidth={1.8}
              color={theme.primary}
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
            We’re still learning your cycle
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: theme.muted,
              },
            ]}
          >
            You selected “I don’t know” for
            your last period date.
          </Text>

          <Pressable
            onPress={() =>
              router.push(
                LAST_PERIOD_ROUTE
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Enter remembered last period date"
            style={({ pressed }) => [
              styles.button,
              {
                borderColor:
                  theme.primary,
              },
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <CalendarDays
              size={18}
              strokeWidth={2}
              color={theme.primary}
            />

            <Text
              style={[
                styles.buttonText,
                {
                  color: theme.primary,
                },
              ]}
            >
              I remembered my date
            </Text>
          </Pressable>
        </View>
      </View>

      <RegisteredBottomNav
        activeItem="home"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },

  card: {
    flex: 1,
    maxHeight: 390,
    marginTop: 6,
    paddingHorizontal: 28,
    paddingVertical: 38,
    borderWidth: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",

    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 3,
  },

  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 22,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    maxWidth: 290,
    marginBottom: 12,
    textAlign: "center",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  description: {
    maxWidth: 275,
    marginBottom: 28,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  buttonText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
});

export default UnknownCycleState;