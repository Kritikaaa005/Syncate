// Destination: src/hooks/useGuestConsent.ts
//
// Guest consent is intentionally device-local only — nothing is sent to
// the backend. This matches the rest of the guest flow (predictions are
// calculated locally too) and avoids creating a server-side data trail
// for users the app is explicitly designed not to identify or store.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY_PREFIX = "syncate-guest-consent-";

type ConsentRecord = {
  version: string;
  agreedAt: string;
};

export function useGuestConsent(docType: string) {
  const [checked, setChecked] = useState(false);
  const [record, setRecord] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY_PREFIX + docType)
      .then((raw) => {
        if (!active) return;
        setRecord(raw ? (JSON.parse(raw) as ConsentRecord) : null);
      })
      .catch(() => {
        // Treat a storage-read failure the same as "no consent on
        // record" — safer than crashing the check, and it just means
        // the guest sees the Terms screen again, not a broken app.
        if (active) setRecord(null);
      })
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [docType]);

  const hasAgreedToVersion = useCallback(
    (version: string) => record?.version === version,
    [record]
  );

  const recordAgreement = useCallback(
    async (version: string) => {
      const next: ConsentRecord = { version, agreedAt: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEY_PREFIX + docType, JSON.stringify(next));
      setRecord(next);
    },
    [docType]
  );

  return { checked, hasAgreedToVersion, recordAgreement };
}