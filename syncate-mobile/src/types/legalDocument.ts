// Destination: src/types/legalDocument.ts

export type LegalDocType =
  | "guest_terms"
  | "guest_privacy"
  | "registered_terms"
  | "registered_privacy";

export type BackendLegalDocument = {
  id: number | string;
  doc_type: LegalDocType;
  title: string;
  version: string;
  content: string;
  effective_date: string;
};

// What GET /api/legal-documents/my-acceptances/ returns — the
// server-side, registered-user counterpart to a guest's local
// AsyncStorage consent record (see useGuestConsent.ts).
export type LegalDocumentAcceptance = {
  doc_type: LegalDocType;
  version: string;
};
