export interface Blog {
  id: string;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  featured_image: string;

  author: string;

  published: boolean;

  published_at: string | null;

  created_at: string;
}