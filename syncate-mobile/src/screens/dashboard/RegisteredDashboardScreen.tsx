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
import { useTheme } from "@/contexts/ThemeContext";
import useDashboardCycle from "@/hooks/useDashboardCycle";

const CALENDAR_ROUTE =
  "/dashboard/calendar" as Href;

const PHASE_ARTICLE_SLUGS = {
  menstrual:
    "understanding-the-menstrual-phase",
  follicular:
    "understanding-the-follicular-phase",
  ovulation:
    "understanding-ovulation",
  luteal:
    "understanding-the-luteal-phase",
} as const;

function getPhaseArticleSlug(
  phaseName: string
): string | null {
  const normalizedPhase =
    phaseName.trim().toLowerCase();

  if (
    normalizedPhase.includes(
      "menstrual"
    ) ||
    normalizedPhase.includes("period")
  ) {
    return PHASE_ARTICLE_SLUGS.menstrual;
  }

  if (
    normalizedPhase.includes(
      "follicular"
    )
  ) {
    return PHASE_ARTICLE_SLUGS.follicular;
  }

  if (
    normalizedPhase.includes(
      "ovulation"
    ) ||
    normalizedPhase.includes(
      "ovulatory"
    )
  ) {
    return PHASE_ARTICLE_SLUGS.ovulation;
  }

  if (
    normalizedPhase.includes("luteal")
  ) {
    return PHASE_ARTICLE_SLUGS.luteal;
  }

  return null;
}

function RegisteredDashboardScreen() {
  const { isDark, colors: theme } = useTheme();

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
    const phaseName =
      cycleSummary.phase.name ||
      cycleSummary.phase.estimatedName;

    const articleSlug =
      getPhaseArticleSlug(phaseName);

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
