// LOCATION: syncate-mobile/src/hooks/useDashboardCycle.ts
// (replaces the existing file)
//
// Swapped getLastPeriod() -> getDashboard(), dropped the
// last_period_status check in createCycleSummary (that field doesn't
// exist on the response anymore — dashboard_state alone tells you
// everything you need). Renamed "unknown" -> "awaiting_first_period"
// to match cycleService.ts.

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getDashboard,
  type DashboardResponse,
  type DashboardState,
} from "@/services/cycleService";
import {
  parseISODate,
  type CycleSummary,
} from "@/utils/cycleCalculations";

type DashboardCycleResult = {
  loading: boolean;
  errorMessage: string;
  dashboardState: DashboardState;
  lastPeriod:
    DashboardResponse | null;
  cycleSummary:
    CycleSummary | null;
  reload: () => Promise<void>;
};

function createCycleSummary(
  data: DashboardResponse
): CycleSummary | null {
  if (
    data.dashboard_state !== "known" ||
    !data.phase ||
    data.cycle_day === null ||
    data.cycle_length === null ||
    !data.current_cycle_start_date ||
    !data.next_period_date ||
    !data.estimated_ovulation_date
  ) {
    return null;
  }

  const progress = Math.min(
    Math.max(
      data.cycle_day / data.cycle_length,
      0
    ),
    1
  );

  return {
    cycleDay: data.cycle_day,
    cycleLength: data.cycle_length,
    progress,

    phase: {
      key: data.phase.key,
      name: data.phase.name,
      estimatedName:
        data.phase.display_name,
      description:
        data.phase.description,
      articleSlug:
        data.phase.article_slug,
    },

    currentCycleStartDate:
      parseISODate(
        data.current_cycle_start_date
      ),

    nextPeriodDate:
      parseISODate(
        data.next_period_date
      ),

    estimatedOvulationDate:
      parseISODate(
        data.estimated_ovulation_date
      ),

    daysUntilNextPeriod:
      data.days_until_next_period ?? 0,

    daysUntilOvulation:
      data.days_until_ovulation ?? 0,
  };
}

function useDashboardCycle():
  DashboardCycleResult {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    lastPeriod,
    setLastPeriod,
  ] =
    useState<DashboardResponse | null>(
      null
    );

  const [
    cycleSummary,
    setCycleSummary,
  ] =
    useState<CycleSummary | null>(
      null
    );

  const [
    dashboardState,
    setDashboardState,
  ] =
    useState<DashboardState>(
      "awaiting_first_period"
    );

  const reload =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response =
          await getDashboard();

        setLastPeriod(response);

        const summary =
          createCycleSummary(
            response
          );

        setCycleSummary(summary);

       setDashboardState(
  response.dashboard_state
);
      } catch (error) {
        setLastPeriod(null);
        setCycleSummary(null);
        setDashboardState(
          "awaiting_first_period"
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : (
                "Could not load "
                + "your cycle "
                + "information."
              )
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    loading,
    errorMessage,
    dashboardState,
    lastPeriod,
    cycleSummary,
    reload,
  };
}

export default useDashboardCycle;