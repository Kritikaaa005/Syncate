import type { BackendArticle } from "@/types/article";

const DEFAULT_API_URL = "http://127.0.0.1:8000/api";
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");

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

export type { BackendArticle } from "@/types/article";
