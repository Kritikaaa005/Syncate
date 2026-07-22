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
