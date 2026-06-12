export type EnquiryStatus = "new" | "contacted" | "closed";

export interface EnquiryItem {
  id: number;
  product_id: number | null;
  product_name: string;
  slug: string | null;
  color: string | null;
  size: string | null;
  price: string | null;
  quantity: number;
}

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
  items: EnquiryItem[];
}
