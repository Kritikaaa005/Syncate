// Destination: src/hooks/useLegalDocument.ts

import { useEffect, useState } from "react";

import { FALLBACK_GUEST_PRIVACY, FALLBACK_GUEST_TERMS } from "@/constants/fallbackLegalDocs";
import { getLegalDocument } from "@/services/legalDocsService";
import type { BackendLegalDocument, LegalDocType } from "@/types/legalDocument";

const FALLBACKS: Partial<Record<LegalDocType, BackendLegalDocument>> = {
  guest_terms: FALLBACK_GUEST_TERMS,
  guest_privacy: FALLBACK_GUEST_PRIVACY,
};

export function useLegalDocument(docType: LegalDocType) {
  const [document, setDocument] = useState<BackendLegalDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setDocument(null);
    setLoading(true);

    getLegalDocument(docType)
      .then((remote) => {
        if (active) setDocument(remote);
      })
      .catch(() => {
        // Only fall back once the real fetch has genuinely failed —
        // never show placeholder text while a real fetch is still in flight.
        if (active) setDocument(FALLBACKS[docType] ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [docType]);

  return { document, loading };
}
