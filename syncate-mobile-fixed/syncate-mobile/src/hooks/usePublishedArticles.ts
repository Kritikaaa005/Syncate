import { useEffect, useState } from "react";

import { FALLBACK_ARTICLES } from "@/constants/fallbackArticles";
import { getPublishedArticles } from "@/services/articleService";
import type { BackendArticle } from "@/types/article";

export function usePublishedArticles() {
  const [articles, setArticles] = useState<BackendArticle[]>(FALLBACK_ARTICLES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      setIsRefreshing(true);
      try {
        const remoteArticles = await getPublishedArticles();
        if (active && remoteArticles.length > 0) setArticles(remoteArticles);
      } catch {
        // Offline/empty backend: retain the bundled educational content.
      } finally {
        if (active) setIsRefreshing(false);
      }
    }

    void loadArticles();
    return () => {
      active = false;
    };
  }, []);

  return { articles, isRefreshing };
}
