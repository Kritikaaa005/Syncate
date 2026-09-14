import { useCallback, useEffect, useState } from "react";

import {
  getDailyLog,
  saveDailyLog,
  type DailyLogResponse,
} from "@/services/trackingService";

export function useDailyLog(logDate: string) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response: DailyLogResponse = await getDailyLog(logDate);
      setData(response.data ?? {});
    } catch {
      setErrorMessage("Couldn't load this day's log.");
    } finally {
      setLoading(false);
    }
  }, [logDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateCategory = useCallback(
    (categoryId: string, value: unknown) => {
      setData((previous) => ({ ...previous, [categoryId]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await saveDailyLog(logDate, {
        data,
     });
      setData(response.data ?? {});
      return true;
    } catch {
      setErrorMessage("Couldn't save this log. Try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [logDate, data]);

  return { data, loading, saving, errorMessage, updateCategory, save, reload: load };
}