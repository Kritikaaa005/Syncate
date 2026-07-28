import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getLastPeriod,
  type LastPeriodResponse,
} from "@/services/cycleService";
import {
  parseISODate,
  type CycleSummary,
} from "@/utils/cycleCalculations";

type DashboardState =
  | "known"
  | "unknown";

type DashboardCycleResult = {
  loading: boolean;
  errorMessage: string;
  dashboardState: DashboardState;
  lastPeriod:
    LastPeriodResponse | null;
  cycleSummary:
    CycleSummary | null;
  reload: () => Promise<void>;
};

function createCycleSummary(
  data: LastPeriodResponse
): CycleSummary | null {
  if (
    data.dashboard_state !== "known" ||
    data.last_period_status !== "known" ||
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
    useState<LastPeriodResponse | null>(
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
      "unknown"
    );

  const reload =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response =
          await getLastPeriod();

        setLastPeriod(response);

        console.log(
  "DASHBOARD RESPONSE:",
  JSON.stringify(
    response,
    null,
    2
  )
);

console.log(
  "DASHBOARD FIELD CHECK:",
  {
    dashboardState:
      response.dashboard_state,
    lastPeriodStatus:
      response.last_period_status,
    phase: response.phase,
    cycleDay:
      response.cycle_day,
    cycleLength:
      response.cycle_length,
    currentCycleStartDate:
      response
        .current_cycle_start_date,
    nextPeriodDate:
      response.next_period_date,
    ovulationDate:
      response
        .estimated_ovulation_date,
    daysUntilNextPeriod:
      response
        .days_until_next_period,
    daysUntilOvulation:
      response
        .days_until_ovulation,
  }
);
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
          "unknown"
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