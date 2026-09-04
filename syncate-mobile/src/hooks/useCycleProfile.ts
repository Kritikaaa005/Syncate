// LOCATION: syncate-mobile/src/hooks/useCycleProfile.ts
// (new file)
//
// One job: load the signed-in user's saved cycle-length / period-
// length answers so ProfilePeriodDetailsScreen has something to
// prefill and edit. Mirrors usePeriodLogs.ts's shape on purpose —
// same load/error/reload contract as every other "fetch one thing
// for a screen" hook in this codebase.

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCycleProfile,
  type CycleProfileResponse,
} from "@/services/cycleService";

type UseCycleProfileResult = {
  loading: boolean;
  errorMessage: string;
  cycleProfile: CycleProfileResponse | null;
  reload: () => Promise<void>;
};

function useCycleProfile(): UseCycleProfileResult {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cycleProfile, setCycleProfile] =
    useState<CycleProfileResponse | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      setCycleProfile(await getCycleProfile());
    } catch (error) {
      setCycleProfile(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your cycle information."
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
    cycleProfile,
    reload,
  };
}

export default useCycleProfile;
