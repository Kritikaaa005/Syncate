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
import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import UnknownCycleState from "@/components/dashboard/UnknownCycleState";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import useDashboardCycle from "@/hooks/useDashboardCycle";

// === CHANGED: this used to point at the single-date logging
// screen — that screen still exists, it just lives at
// /dashboard/log-period now. /dashboard/calendar is the new
// year-long phase view (see app/dashboard/calendar.tsx), which is
// also what the bottom nav's Calendar tab already links to.
const CALENDAR_ROUTE =
  "/dashboard/log-period" as Href;

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
    lastPeriod?.nickname?.trim() ||
    "there";

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

  // === CHANGED: "unknown" -> "awaiting_first_period", matching the
  // rename in cycleService.ts / useDashboardCycle.ts.
  if (dashboardState === "awaiting_first_period") {
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
    const articleSlug =
      cycleSummary.phase.articleSlug;

    if (!articleSlug) {
      Alert.alert(
        "Article unavailable",
        "We could not find an article for your current cycle phase."
      );

      return;
    }

    router.push(
      `/guest/articles/${articleSlug}` as Href
    );
  };

  const openPeriodCalendar = () => {
    router.push(CALENDAR_ROUTE);
  };

  const openSymptoms = () => {
    Alert.alert(
      "Symptoms",
      "Symptom tracking will be connected here."
    );
  };

  const openSexTracking = () => {
    Alert.alert(
      "Sex",
      "Sex tracking will be connected here."
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
          onLogPeriodPress={
            openPeriodCalendar
          }
          onSymptomsPress={
            openSymptoms
          }
          onSexPress={
            openSexTracking
          }
        />
      </ScrollView>

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