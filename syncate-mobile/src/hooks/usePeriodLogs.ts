// LOCATION: syncate-mobile/src/hooks/usePeriodLogs.ts
//
// One job: load the signed-in user's period history so the calendar
// can tell whether a tapped logged day belongs to an existing period
// and enter inline edit mode. Calendar phase fetching remains in
// useCycleCalendar.

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getPeriodLogs,
  type PeriodLogResponse,
} from "@/services/cycleService";

type UsePeriodLogsResult = {
  loading: boolean;
  errorMessage: string;
  periodLogs: PeriodLogResponse[];
  reload: () => Promise<void>;
};

function usePeriodLogs(): UsePeriodLogsResult {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [periodLogs, setPeriodLogs] = useState<PeriodLogResponse[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      setPeriodLogs(await getPeriodLogs());
    } catch (error) {
      setPeriodLogs([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your period history."
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
    periodLogs,
    reload,
  };
}

export default usePeriodLogs;
