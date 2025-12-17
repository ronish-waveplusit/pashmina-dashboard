// Product Types - Updated to match API structure

// Base variation structure from API response
export interface ProductVariation {
  id: number;
  sku: string;
  price: string;
  sale_price: string;
  quantity: number;
  low_stock_threshold: number;
  status: string;
  image?: string;
  created_at: string;
  updated_at: string;
  stock_status:string;
}

// Variation with attributes for size_color type
export interface ProductVariationWithAttributes extends ProductVariation {
  attributes: Array<{
    attribute_id: number;
    attribute_value_id: number;
  }>;
}

// API Response structure
export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  code: string;
  composition: string | null;
  excerpt: string | null;
  description: string;
  featured_image: string;
  gallery_images: string[];
  variation_type: "color" | "size_color";
  variations: ProductVariationWithAttributes[];
  categories?: Array<{ id: number; name: string }> | { id: number; name: string } | string;
  category?: Array<{ id: number; name: string }> | { id: number; name: string } | string;
  created_at: string;
  updated_at: string;
  status: string;
  attributes?: Array<{
    attribute: {
      id: number;
      name: string;
      attribute_values?: Array<{
        id: number;
        name: string;
      }>;
    };
  }>;
}

// Attribute structure for size_color products
export interface ProductAttribute {
  id?:number;
  attribute_id: number;
  attribute_value_ids: number[];
}

// Form data for color variation type
export interface ColorProductFormData {
  name: string;
  slug?: string;
  code: string;
  description: string;
  composition?: string;
  excerpt?: string;
  price: string;
  sale_price: string;
  quantity: number;
  status: string;
  variation_type: "color";
  low_stock_threshold: number;
  category_id?: number[];
  featured_image?: File;
  gallery_images?: File[];
  delete_featured_image?: boolean;
  delete_media_uuids?: string[];
}

// Form data for size_color variation type
export interface SizeColorProductFormData {
  name: string;
  slug?: string;
  code: string;
  description: string;
  composition?: string;
  excerpt?: string;
  status: string;
  variation_type: "size_color";
  attributes: ProductAttribute[];
  variations: Array<{
    id?: number; // Optional ID for existing variations
    sku: string;
    price: string;
    sale_price: string;
    quantity: number;
    low_stock_threshold: number;
    status: string;
    attributes: Array<{
      attribute_id: number;
      attribute_value_id: number;
    }>;
    image?: File | string; // Can be File (new) or string (existing URL)
  }>;
  category_id?: number[];
  featured_image?: File;
  gallery_images?: File[];
  delete_featured_image?: boolean;
  delete_media_uuids?: string[];
  variant_images?: File[];
}

// Union type for form data
export type ProductFormData = ColorProductFormData | SizeColorProductFormData;

// Form data with id for edit mode
export type ProductFormDataWithId = (ColorProductFormData | SizeColorProductFormData) & {
  id: number;
};

// Category structure
export interface CategoryItem {
  id: number;
  name: string;
}

// Helper type guards
export function isColorProduct(
  product: ProductFormData | ProductResponse
): product is ColorProductFormData | (ProductResponse & { variation_type: "color" }) {
  return product.variation_type === "color";
}

export function isSizeColorProduct(
  product: ProductFormData | ProductResponse
): product is SizeColorProductFormData | (ProductResponse & { variation_type: "size_color" }) {
  return product.variation_type === "size_color";
}

// Helper to convert API response to form data
export function productResponseToFormData(
  product: ProductResponse
): ProductFormDataWithId {
  if (isColorProduct(product)) {
    const firstVariation = product.variations[0];
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      code: product.code,
      description: product.description,
      composition: product.composition || undefined,
      excerpt: product.excerpt || undefined,
      price: firstVariation?.price || "0",
      sale_price: firstVariation?.sale_price || "0",
      quantity: firstVariation?.quantity || 0,
      status: product.variations[0]?.status || "active",
      variation_type: "color",
      low_stock_threshold: firstVariation?.low_stock_threshold || 0,
    };
  } else {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      code: product.code,
      description: product.description,
      composition: product.composition || undefined,
      excerpt: product.excerpt || undefined,
      status: product.variations[0]?.status || "active",
      variation_type: "size_color",
      attributes: [],
      variations: product.variations.map(v => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        sale_price: v.sale_price,
        quantity: v.quantity,
        low_stock_threshold: v.low_stock_threshold,
        status: v.status,
        image: v.image,
        attributes: [],
      })),
    };
  }
}

// Helper to convert form data to FormData object
export function productFormDataToFormData(
  data: ProductFormData | ProductFormDataWithId
): FormData {
  const formData = new FormData();

  // Common fields
  formData.append("name", data.name);
  formData.append("code", data.code);
  formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("variation_type", data.variation_type);

  if (data.slug) formData.append("slug", data.slug);
  if (data.composition) formData.append("composition", data.composition);
  if (data.excerpt) formData.append("excerpt", data.excerpt);

  // Handle categories
  if (data.category_id) {
    data.category_id.forEach(id => {
      formData.append("category_id[]", id.toString());
    });
  }

  // Handle images
  if (data.featured_image instanceof File) {
    formData.append("featured_image", data.featured_image);
  }

  if (data.gallery_images) {
    data.gallery_images.forEach(img => {
      if (img instanceof File) {
        formData.append("gallery_images[]", img);
      }
    });
  }

  if (data.delete_featured_image) {
    formData.append("delete_featured_image", "true");
  }

  if (data.delete_media_uuids) {
    data.delete_media_uuids.forEach(uuid => {
      formData.append("delete_media_uuids[]", uuid);
    });
  }

  // Variation type specific fields
  if (isColorProduct(data)) {
    formData.append("price", data.price);
    formData.append("sale_price", data.sale_price);
    formData.append("quantity", data.quantity.toString());
    formData.append("low_stock_threshold", data.low_stock_threshold.toString());
  } else {
    // size_color type
    data.attributes.forEach((attr, attrIdx) => {
      formData.append(`attributes[${attrIdx}][attribute_id]`, attr.attribute_id.toString());
      attr.attribute_value_ids.forEach((valId, valIdx) => {
        formData.append(
          `attributes[${attrIdx}][attribute_value_ids][${valIdx}]`,
          valId.toString()
        );
      });
    });

    data.variations.forEach((variation, varIdx) => {
      if (variation.id) {
        formData.append(`variations[${varIdx}][id]`, variation.id.toString());
      }
      
      formData.append(`variations[${varIdx}][sku]`, variation.sku);
      formData.append(`variations[${varIdx}][price]`, variation.price);
      formData.append(`variations[${varIdx}][sale_price]`, variation.sale_price);
      formData.append(`variations[${varIdx}][quantity]`, variation.quantity.toString());
      formData.append(
        `variations[${varIdx}][low_stock_threshold]`,
        variation.low_stock_threshold.toString()
      );
      formData.append(`variations[${varIdx}][status]`, variation.status);

      variation.attributes.forEach((attr, attrIdx) => {
        formData.append(
          `variations[${varIdx}][attributes][${attrIdx}][attribute_id]`,
          attr.attribute_id.toString()
        );
        formData.append(
          `variations[${varIdx}][attributes][${attrIdx}][attribute_value_id]`,
          attr.attribute_value_id.toString()
        );
      });

      if (variation.image instanceof File) {
        formData.append(`variations[${varIdx}][image]`, variation.image);
      }
    });

    if (data.variant_images) {
      data.variant_images.forEach(img => {
        if (img instanceof File) {
          formData.append("variant_images[]", img);
        }
      });
    }
  }

  return formData;
}