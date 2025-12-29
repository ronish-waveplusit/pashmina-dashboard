import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import {
  ChalanListItem,
  ChalanDetail,
  CreateChalanPayload,
} from "../types/chalani";

interface GetChalanParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  issue_date?: string;
}

/**
 * Fetch paginated chalani list
 */
export async function getChalani(
  params?: GetChalanParams
): Promise<PaginatedResponse<ChalanListItem>> {
  const response = await http({
    url: apiRoutes.GET_CHALANI,
    method: "get",
    params,
  });

  return response.data.data;
}

/**
 * Fetch single chalani by ID
 */
export async function getChalaniById(
  chalanId: string | number
): Promise<ChalanDetail> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_CHALANI}/${chalanId}`,
      method: "get",
    });

    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch chalani with id ${chalanId}:`, error);
    throw error;
  }
}

/**
 * Create new chalani
 */
export async function createChalani(
  data: CreateChalanPayload
): Promise<ChalanDetail> {
  try {
    const response = await http({
      url: apiRoutes.GET_CHALANI,
      method: "post",
      data,
    });

    return response.data.data;
  } catch (error) {
    console.error("Failed to create chalani:", error);
    throw error;
  }
}

/**
 * Delete chalani by ID
 */
export async function deleteChalani(
  chalanId: string | number
): Promise<void> {
  try {
    await http({
      url: `${apiRoutes.GET_CHALANI}/${chalanId}`,
      method: "delete",
    });
  } catch (error) {
    console.error(`Failed to delete chalani with id ${chalanId}:`, error);
    throw error;
  }
}
