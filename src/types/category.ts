export interface CategoryPayload {
  id: string | number;
  name: string;
  parent_category_id?: string | number | null;
  featured_image?: string | null; // URL when fetching
}

export interface CategoryFormData {
  name: string;
  parent_category_id?: string | number | null;
  featured_image?: File | null;
  remove_featured_image?: string; 
}