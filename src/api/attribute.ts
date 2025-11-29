// api/attribute.ts
import http from "../utils/helper/http";
import { AttributePayload, AttributeValuePayload, AttributeWithValues } from "../types/attribute";
import { PaginatedResponse } from "../types/pagination";

// Attribute API calls
export async function getAttributes(
  params?: Record<string, any>
): Promise<PaginatedResponse<AttributeWithValues>> {
  const response = await http({
    url: "/product/attributes",
    method: "get",
    params,
  });
  return response.data;
}

export async function getAttributeById(
  id: string | number
): Promise<{ data: AttributeWithValues }> {
  const response = await http({
    url: `/product/attributes/${id}`,
    method: "get",
  });
  return response.data;
}

export async function createAttribute(
  formData: FormData
): Promise<AttributePayload> {
  const response = await http({
    url: "/product/attributes",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function updateAttribute({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<AttributePayload> {
  const response = await http({
    url: `/product/attributes/${id}`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function deleteAttribute(id: string | number): Promise<void> {
  await http({
    url: `/product/attributes/${id}`,
    method: "delete",
  });
}

// Attribute Value API calls
export async function getAttributeValues(
  params?: Record<string, any>
): Promise<PaginatedResponse<AttributeValuePayload>> {
  const response = await http({
    url: "/product/attribute-values",
    method: "get",
    params,
  });
  return response.data;
}

export async function getAttributeValueById(
  id: string | number
): Promise<{ data: AttributeValuePayload }> {
  const response = await http({
    url: `/product/attribute-values/${id}`,
    method: "get",
  });
  return response.data;
}

export async function createAttributeValue(
  formData: FormData
): Promise<AttributeValuePayload> {
  const response = await http({
    url: "/product/attribute-values",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function updateAttributeValue({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<AttributeValuePayload> {
  const response = await http({
    url: `/product/attribute-values/${id}`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function deleteAttributeValue(id: string | number): Promise<void> {
  await http({
    url: `/product/attribute-values/${id}`,
    method: "delete",
  });
}