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
  created_at: string;   
  updated_at: string;
  lots?: Lot[];  // Add this line
}

export interface Lot {
  id: number;
  lotable_id: number;
  lotable_type: string; 
  imported_date: string;
  quantity_received: number;
  created_at: string;  // Add this line
  updated_at?: string; // Optional, in case you need it later
}