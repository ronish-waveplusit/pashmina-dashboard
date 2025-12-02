export interface CategoryPayload {
  id: string | number;
  name: string;
  parent_id?: string | number | null;
  featured_image?: string | null;
   parent?: ParentCategory;
}
export interface ParentCategory {
  id: string | number;
  name: string;
}
export interface CategoryFormData {
  name: string;
  parent_id?: string | number | null;
  featured_image?: File | null;
  remove_featured_image?: string; 
}