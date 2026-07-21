import { useEffect, useState } from "react";

import { findFallbackArticle } from "@/constants/fallbackArticles";
import { getPublishedArticle } from "@/services/articleService";
import type { BackendArticle } from "@/types/article";

export function usePublishedArticle(slug?: string) {
  const [article, setArticle] = useState<BackendArticle | null>(
    slug ? findFallbackArticle(slug) ?? null : null,
  );
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      if (!slug) {
        setLoading(false);
        setError("Article not found.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const remoteArticle = await getPublishedArticle(slug);
        if (active) setArticle(remoteArticle);
      } catch {
        const fallback = findFallbackArticle(slug);
        if (active) {
          setArticle(fallback ?? null);
          if (!fallback) setError("Article not found.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadArticle();
    return () => {
      active = false;
    };
  }, [slug]);

  return { article, loading, error };
}
