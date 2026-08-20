// LOCATION: syncate-mobile/src/hooks/useCycleCalendar.ts
//
// One job: lazily load and cache calendar years for the continuous
// multi-year calendar. The backend still owns all phase calculations;
// this hook only combines GET /me/calendar/?year= responses into one
// date-keyed map as years become visible.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getCalendar,
  type CalendarDay,
} from "@/services/cycleService";

type UseCycleCalendarResult = {
  loading: boolean;
  errorMessage: string;
  daysByDate: Map<string, CalendarDay>;
  ensureYears: (years: number[]) => Promise<void>;
  reloadLoadedYears: () => Promise<void>;
};

function useCycleCalendar(
  initialYear: number
): UseCycleCalendarResult {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [daysByDate, setDaysByDate] = useState<
    Map<string, CalendarDay>
  >(new Map());

  const loadedYearsRef = useRef<Set<number>>(new Set());
  const inFlightRef = useRef<Map<number, Promise<void>>>(new Map());

  const loadYear = useCallback(
    (year: number, force = false): Promise<void> => {
      if (!force && loadedYearsRef.current.has(year)) {
        return Promise.resolve();
      }

      const existingRequest = inFlightRef.current.get(year);
      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
        try {
          const response = await getCalendar(year);

          setDaysByDate((current) => {
            const next = new Map(current);

            // A forced reload replaces that year's dates instead of
            // leaving any stale entries behind.
            if (force) {
              const yearPrefix = `${year}-`;

              for (const dateKey of next.keys()) {
                if (dateKey.startsWith(yearPrefix)) {
                  next.delete(dateKey);
                }
              }
            }

            for (const day of response.days) {
              next.set(day.date, day);
            }

            return next;
          });

          loadedYearsRef.current.add(response.year);
          setErrorMessage("");
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load your calendar."
          );
        } finally {
          inFlightRef.current.delete(year);
        }
      })();

      inFlightRef.current.set(year, request);
      return request;
    },
    []
  );

  const ensureYears = useCallback(
    async (years: number[]) => {
      const uniqueYears = Array.from(new Set(years));

      await Promise.all(
        uniqueYears.map((year) => loadYear(year))
      );
    },
    [loadYear]
  );

  const reloadLoadedYears = useCallback(async () => {
    const years = Array.from(loadedYearsRef.current);

    if (!years.includes(initialYear)) {
      years.push(initialYear);
    }

    await Promise.all(
      years.map((year) => loadYear(year, true))
    );
  }, [initialYear, loadYear]);

  useEffect(() => {
    let active = true;

    const loadInitialCalendar = async () => {
      setLoading(true);
      await loadYear(initialYear);

      if (active) {
        setLoading(false);
      }

      // Preload the neighboring years in the background so opening the
      // calendar only waits for the year the user is actually seeing.
      void Promise.all([
        loadYear(initialYear - 1),
        loadYear(initialYear + 1),
      ]);
    };

    void loadInitialCalendar();

    return () => {
      active = false;
    };
  }, [initialYear, loadYear]);

  return {
    loading,
    errorMessage,
    daysByDate,
    ensureYears,
    reloadLoadedYears,
  };
}

export default useCycleCalendar;
