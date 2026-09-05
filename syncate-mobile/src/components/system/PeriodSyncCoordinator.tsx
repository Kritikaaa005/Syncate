import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { triggerAutomaticPeriodSync } from "@/services/periodSyncService";

function hasUsableConnection(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function PeriodSyncCoordinator() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const wasOnline = useRef<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncIfOnline = async () => {
      try {
        const state = await NetInfo.fetch();

        if (isMounted && hasUsableConnection(state)) {
          void triggerAutomaticPeriodSync();
        }
      } catch {
        if (__DEV__) {
          console.warn("Could not determine connectivity for period synchronization.");
        }
      }
    };

    void syncIfOnline();

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appState.current;
      appState.current = nextState;

      if (previousState !== "active" && nextState === "active") {
        void syncIfOnline();
      }
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isOnline = hasUsableConnection(state);
      const connectivityWasRestored = wasOnline.current === false && isOnline;

      wasOnline.current = isOnline;

      if (connectivityWasRestored) {
        void triggerAutomaticPeriodSync();
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      unsubscribeNetInfo();
    };
  }, []);

  return null;
}
