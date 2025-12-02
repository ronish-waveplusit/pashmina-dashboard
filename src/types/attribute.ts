// types/attribute.ts

export interface AttributeValuePayload {
  id: string | number;
  attribute_id: string | number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttributePayload {
  id: string | number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

// This is the full response when listing attributes (includes values)
export interface AttributeWithValues extends AttributePayload {
  attributeValues?: AttributeValuePayload[];
}

// Form data types
export interface AttributeFormData {
  name: string;
  slug?: string;
}

export interface AttributeValueFormData {
  attribute_id: string | number;
  name: string;
}