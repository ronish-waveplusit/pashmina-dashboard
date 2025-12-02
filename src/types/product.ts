export interface ProductAttribute {
  id: string;
  name: string;
  values: string;
  visibleOnProduct: boolean;
  usedForVariations: boolean;
}

export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  image?: string;
  costPrice: string;
  salePrice: string;
  stock: string;
  lst: string;
  sku: string;
  description: string;
  weight: string;
  status: string;
}

export interface ProductFormData {
  productName: string;
  description: string;
  ingredients: string;
  details: string;
  images: string[];
  sellingPrice: string;
  costPrice: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: string;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}
