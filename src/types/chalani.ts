/* =======================
   LISTING INTERFACE
======================= */
export interface ChalanListItem {
  id: number;
  chalan_no: string;
  name: string;
  issue_date: string;
  total_amount: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
}

/* =======================
   SHOW / DETAIL INTERFACES
======================= */
export interface ProductVariation {
  id: number;
  name: string;
}

export interface ChalanItem {
  id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_variations: ProductVariation;
}

export interface ChalanDetail {
  id: number;
  chalan_no: string;
  name: string;
  issue_date: string;
  total_amount: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  chalani_items: ChalanItem[];
}

/* =======================
   CREATE PAYLOAD INTERFACES
======================= */
export interface CreateChalanItemPayload {
  product_variation_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateChalanPayload {
  is_guide: boolean;
  name: string;
  issue_date: string;
  total_amount: number;
  discount_type: "percentage" | "fixed"|null;
  discount_value: number;
  chalan_items: CreateChalanItemPayload[];
}
