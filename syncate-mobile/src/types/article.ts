export type BackendArticle = {
  id: number | string;

  title: string;
  slug: string;

  short_description: string;
  content: string;

  author: string;

  category: string;

  content_types: { name: string }[];

  cover_image_url: string | null;

  published_date?: string;
};