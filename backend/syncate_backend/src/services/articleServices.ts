const API_URL = "http://127.0.0.1:8000/api";

export type BackendArticle = {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  content: string;
  cover_image_url: string | null;
};

export async function getPublishedArticles(): Promise<BackendArticle[]> {
  const res = await fetch(`${API_URL}/articles/`);
  if (!res.ok) throw new Error("Failed to fetch articles");

  const data = await res.json();
  console.log("ARTICLES API:", data);

  return Array.isArray(data) ? data : data.results ?? [];
}

export async function getPublishedArticle(slug: string): Promise<BackendArticle> {
  const res = await fetch(`${API_URL}/articles/${slug}/`);
  if (!res.ok) throw new Error("Failed to fetch article");

  return res.json();
}