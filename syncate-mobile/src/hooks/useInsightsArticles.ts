import { useEffect, useMemo, useState } from "react";

import {
  getContentTypes,
  getPublishedArticles,
  type BackendArticle,
  type ContentType,
} from "@/services/articleService";

export type CategorySection = {
  category: ContentType;
  articles: BackendArticle[];
};

type UseInsightsArticlesResult = {
  categories: ContentType[];
  sections: CategorySection[];
  loading: boolean;
};

export function useInsightsArticles(): UseInsightsArticlesResult {
  const [articles, setArticles] = useState<BackendArticle[]>([]);
  const [categories, setCategories] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const [articlesResult, categoriesResult] = await Promise.all([
          getPublishedArticles(),
          getContentTypes(),
        ]);

        if (!active) return;

        setArticles(articlesResult);
        setCategories(categoriesResult);
      } catch {
        // Offline/empty backend: leave lists empty, sections just won't render.
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const sections = useMemo<CategorySection[]>(() => {
    return categories
      .map((category) => ({
        category,
        articles: articles.filter((article) =>
          article.content_types?.some(
            (contentType) => contentType.name === category.name
          )
        ),
      }))
      .filter((section) => section.articles.length > 0);
  }, [articles, categories]);

  return { categories, sections, loading };
}
