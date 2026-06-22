export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
  is_active: boolean;
  featured_image: string | null;
  created_at?: string;
  updated_at?: string;
}
