// Destination: src/hooks/useRegisteredConsent.ts
//
// The registered-user counterpart to useGuestConsent.ts — same
// `checked` / `hasAgreedToVersion` shape, so the comparison logic reads
// identically either way. `recordAgreement` deliberately does NOT take a
// version argument here (unlike the guest hook) — see its own comment
// below for why. Callers (the registered-terms page, not TermsPrivacyScreen
// itself) already know which hook they're using, so this isn't meant to
// be a drop-in swap, just a parallel shape.
//
// Fetches ALL of the user's acceptances once per mount (not per
// doc_type) since the acceptance endpoint already returns everything in
// one call — calling it once per doc_type instance of this hook would
// just be the same network request duplicated.

import { useCallback, useEffect, useState } from "react";

import { acceptLegalDocument, getMyLegalAcceptances } from "@/services/legalDocsService";
import type { LegalDocType, LegalDocumentAcceptance } from "@/types/legalDocument";

export function useRegisteredConsent(docType: LegalDocType) {
  const [checked, setChecked] = useState(false);
  const [acceptances, setAcceptances] = useState<LegalDocumentAcceptance[]>([]);

  useEffect(() => {
    let active = true;

    getMyLegalAcceptances()
      .then((records) => {
        if (active) setAcceptances(records);
      })
      .catch(() => {
        // Same reasoning as useGuestConsent's storage-read failure:
        // treat a failed fetch as "nothing accepted yet" rather than
        // crashing — worst case the user sees the Terms screen again.
        if (active) setAcceptances([]);
      })
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const hasAgreedToVersion = useCallback(
    (version: string) => acceptances.some((a) => a.doc_type === docType && a.version === version),
    [acceptances, docType]
  );

  const recordAgreement = useCallback(async () => {
    // Version isn't passed in here (unlike useGuestConsent) — the server
    // decides what "the current version" is and stamps that, so the
    // client can't record acceptance of a version it made up. See
    // LegalDocumentAcceptanceView's docstring in legal_docs/views.py.
    const updated = await acceptLegalDocument(docType);
    setAcceptances((prev) => [...prev.filter((a) => a.doc_type !== docType), updated]);
  }, [docType]);

  return { checked, hasAgreedToVersion, recordAgreement };
}
