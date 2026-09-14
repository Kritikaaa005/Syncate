import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { getAccessToken } from "@/utils/tokenStorage";

function hasUsableConnection(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

async function triggerNativePeriodSync(): Promise<void> {
  // The current offline queue is a native SQLite feature. Keeping the import
  // lazy prevents app startup (and Expo Router's web/static renderer) from
  // loading expo-sqlite when there is no authenticated user to synchronize.
  if (Platform.OS === "web") {
    return;
  }

  try {
    if (!(await getAccessToken())) {
      return;
    }

    const { triggerAutomaticPeriodSync } = await import(
      "@/services/periodSyncService"
    );

    await triggerAutomaticPeriodSync();
  } catch {
    // Offline synchronization must never make the whole app fail to open.
    // A later foreground/network event can try again.
    if (__DEV__) {
      console.warn("Automatic period synchronization could not start.");
    }
  }
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
          await triggerNativePeriodSync();
        }
      } catch {
        if (__DEV__) {
          console.warn(
            "Could not determine connectivity for period synchronization."
          );
        }
      }
    };

    void syncIfOnline();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const previousState = appState.current;
        appState.current = nextState;

        if (previousState !== "active" && nextState === "active") {
          void syncIfOnline();
        }
      }
    );

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isOnline = hasUsableConnection(state);
      const connectivityWasRestored = wasOnline.current === false && isOnline;

      wasOnline.current = isOnline;

      if (connectivityWasRestored) {
        void triggerNativePeriodSync();
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
