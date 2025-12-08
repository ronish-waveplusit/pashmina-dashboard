import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

import { PaginatedResponse } from "../types/pagination";
import { ProductVariation,Lot } from "../types/product-variation";

interface GetProductVariationParams {
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
 * Fetches a list of all TransactionCategory. (GET /transaction-categories)
 * This is an improved version of your original function.
 */
export async function getProductVariation(
  params: GetProductVariationParams
): Promise<PaginatedResponse<ProductVariation>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT_VARIATIONS,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}
export async function getLot(
  params: GetProductVariationParams
): Promise<PaginatedResponse<Lot>> {
  const response = await http({
    url: apiRoutes.GET_LOT,
    method: "get",
    params: params,
  });
 
  return response.data.data;
}

export async function createLot(
  data: Lot | FormData
) {
  try {
    const response = await http({
      url: apiRoutes.GET_LOT,
      method: "post",
      data: data,
       headers: {
        'Content-Type': 'multipart/form-data', 
      } 
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create course:", error);
    throw error;
  }
}