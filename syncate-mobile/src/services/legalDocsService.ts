// Destination: src/services/legalDocsService.ts

import type { BackendLegalDocument, LegalDocType } from "@/types/legalDocument";
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
