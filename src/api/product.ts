import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import {
  ProductResponse,
  ProductFormData,
  ProductFormDataWithId,
  productFormDataToFormData,
} from "../types/product";

interface GetProductParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
  status?: string;
  category?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * Fetches a paginated list of products
 */
export async function getProduct(
  params: GetProductParams
): Promise<PaginatedResponse<ProductResponse>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT,
    method: "get",
    params: params,
  });
  return response.data.data;
}

/**
 * Fetches products by branch ID
 */
export async function getProductByBranchId(
  branch_id: string | number,
  params?: GetProductParams
): Promise<PaginatedResponse<ProductResponse>> {
  const response = await http({
    url: `${apiRoutes.GET_PRODUCT}/branch/${branch_id}`,
    method: "get",
    params: params,
  });
  return response.data.data;
}

/**
 * Fetches a single product by its ID
 */
export async function getProductById(
  productId: string | number
): Promise<ProductResponse> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT}/${productId}`,
      method: "get",
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch product with id ${productId}:`, error);
    throw error;
  }
}

/**
 * Creates a new product
 */
export async function createProduct(
  data: ProductFormData | FormData
): Promise<ProductResponse> {
  try {
    const formData = data instanceof FormData ? data : productFormDataToFormData(data);

    const response = await http({
      url: apiRoutes.GET_PRODUCT,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

/**
 * Updates an existing product by its ID
 */
export async function updateProduct(
  id: string | number,
  data: ProductFormData | ProductFormDataWithId | FormData
): Promise<ProductResponse> {
  try {
    const formData = data instanceof FormData ? data : productFormDataToFormData(data);

    const response = await http({
      url: `${apiRoutes.GET_PRODUCT}/${id}`,
      method: "put",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update product with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a product by its ID
 */
export async function deleteProduct(productId: string | number): Promise<void> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT}/${productId}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete product with id ${productId}:`, error);
    throw error;
  }
}