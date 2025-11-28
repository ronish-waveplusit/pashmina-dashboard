// types/attribute.ts

export interface AttributeValue {
  id: string | number;
  attribute_id: string | number;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attribute {
  id: string | number;
  name: string;
  slug: string;
  attributeValues?: AttributeValue[]; // This is the full attribute with values (from listing)
  created_at?: string;
  updated_at?: string;
}

// This is what comes from create/update forms (no values)
export interface AttributePayload {
  id: string | number;
  name: string;
  slug?: string;
}

// This is the full response when listing attributes (includes values)
export interface AttributeWithValues extends AttributePayload {
  attributeValues?: AttributeValue[];
}

// Payloads for forms
export interface AttributeFormData {
  name: string;
  slug?: string;
}

export interface AttributeValuePayload {
  id?: string | number;
  attribute_id: string | number;
  value: string;
}

export interface AttributeValueFormData {
  attribute_id: string | number;
  value: string;
}