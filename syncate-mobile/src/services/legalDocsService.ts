// Destination: src/services/legalDocsService.ts

import type { BackendLegalDocument, LegalDocType, LegalDocumentAcceptance } from "@/types/legalDocument";
import { authenticatedFetch } from "@/utils/authenticatedFetch";
import { API_BASE_URL } from "@/utils/getApiBaseUrl";

async function requestJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLegalDocument(docType: LegalDocType): Promise<BackendLegalDocument> {
  return requestJson<BackendLegalDocument>(`/legal-documents/${encodeURIComponent(docType)}/`);
}

// --- Registered-user (authenticated) acceptance — see
// useRegisteredConsent.ts for how this replaces useGuestConsent's
// AsyncStorage record for a real account. ---

export async function getMyLegalAcceptances(): Promise<LegalDocumentAcceptance[]> {
  const response = await authenticatedFetch("/legal-documents/my-acceptances/");
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as LegalDocumentAcceptance[];
}

export async function acceptLegalDocument(docType: LegalDocType): Promise<LegalDocumentAcceptance> {
  const response = await authenticatedFetch("/legal-documents/accept/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_type: docType }),
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as LegalDocumentAcceptance;
}
