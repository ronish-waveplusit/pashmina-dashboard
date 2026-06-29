export interface ProductVariation {
  id: number;
  product_name: string;
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  stock_status: "low_stock" | "in_stock" | "out_of_stock";
  status: "active" | "inactive";
  color?: string | null;
  size?: string | null;
  created_at: string;
  updated_at: string;
  lots?: Lot[]; // Add this line
}

export interface Lot {
  id: number;
  lotable_id: number;
  lotable_type: string;
  imported_date: string;
  import_price: string | number;
  quantity_received: number;
  created_at: string;
  updated_at?: string;
}
