export interface Banner {
  id: number;
  title: string;
  banner_text_1: string | null;
  banner_text_2: string | null;
  link_url: string | null;
  is_active: boolean;
  order_column: number;
  banner_image: string | null;
  created_at?: string;
  updated_at?: string;
}
