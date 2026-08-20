import { API_BASE_URL } from "@/utils/getApiBaseUrl";
import type { BackendArticle } from "@/types/article";

const API_URL = API_BASE_URL;

async function requestJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
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

type PaginatedArticles = { results?: BackendArticle[] };

export async function getPublishedArticles(): Promise<BackendArticle[]> {
  const data = await requestJson<BackendArticle[] | PaginatedArticles>("/articles/");
  return Array.isArray(data) ? data : data.results ?? [];
}

export async function getPublishedArticle(slug: string): Promise<BackendArticle> {
  return requestJson<BackendArticle>(`/articles/${encodeURIComponent(slug)}/`);
}

export type ContentType = {
  content_type_id: number;
  name: string;
  description: string;
};

type PaginatedContentTypes = { results?: ContentType[] };

export async function getContentTypes(): Promise<ContentType[]> {
  const data = await requestJson<ContentType[] | PaginatedContentTypes>("/content-types/");
  return Array.isArray(data) ? data : data.results ?? [];
}

export type { BackendArticle } from "@/types/article";