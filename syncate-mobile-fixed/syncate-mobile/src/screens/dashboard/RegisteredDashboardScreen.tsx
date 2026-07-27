import {
  type Href,
  router,
} from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CycleSummaryCard from "@/components/dashboard/CycleSummaryCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  DashboardError,
  DashboardLoading,
} from "@/components/dashboard/DashboardStatus";
import LogPeriodButton from "@/components/dashboard/LogPeriodButton";
import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import UnknownCycleState from "@/components/dashboard/UnknownCycleState";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useDashboardCycle from "@/hooks/useDashboardCycle";

const CALENDAR_ROUTE =
  "/dashboard/calendar" as Href;

function RegisteredDashboardScreen() {
  const { isDark } = useTheme();

  const theme = isDark
    ? guestTheme.mode.dark
    : guestTheme.mode.light;

  const {
    loading,
    errorMessage,
    dashboardState,
    lastPeriod,
    cycleSummary,
    reload,
  } = useDashboardCycle();

  const nickname =
    lastPeriod?.nickname?.trim()
    || "there";

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <DashboardLoading />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <DashboardError
          message={errorMessage}
          onRetry={() => {
            void reload();
          }}
        />
      </SafeAreaView>
    );
  }

 if (dashboardState === "unknown") {
  return (
    <UnknownCycleState
      nickname={nickname}
    />
  );
}

if (!cycleSummary) {
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <DashboardError
        message="Your period date was saved, but the dashboard data could not be displayed."
        onRetry={() => {
          void reload();
        }}
      />
    </SafeAreaView>
  );
}

  const handleLearnMore = () => {
    Alert.alert(
      cycleSummary
        .phase
        .estimatedName,
      cycleSummary
        .phase
        .description
    );
  };

  const openPeriodCalendar = () => {
    router.push(
      CALENDAR_ROUTE
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <DashboardHeader
          nickname={nickname}
          hasUnreadNotifications={
            false
          }
          onNotificationsPress={() => {
            Alert.alert(
              "Notifications",
              "You have no new notifications."
            );
          }}
        />

        <CycleSummaryCard
          summary={cycleSummary}
          onLearnMorePress={
            handleLearnMore
          }
        />

        <LogPeriodButton
          onPress={
            openPeriodCalendar
          }
        />
      </ScrollView>

      <RegisteredBottomNav
        activeItem="home"
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },

    scrollContent: {
      width: "100%",
      maxWidth: 430,
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 120,
    },
  });

export default RegisteredDashboardScreen;