import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { Banner } from "../types/banner";

interface GetBannersParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
}

/**
 * Fetches a paginated list of banners. (GET /v1/cms/banners)
 */
export async function getBanners(
  params: GetBannersParams
): Promise<PaginatedResponse<Banner>> {
  const response = await http({
    url: apiRoutes.GET_BANNERS,
    method: "get",
    params,
  });
  return response.data.data;
}

/**
 * Creates a new banner. (POST /v1/cms/banners)
 */
export async function createBanner(data: FormData): Promise<Banner> {
  try {
    const response = await http({
      url: apiRoutes.GET_BANNERS,
      method: "post",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create banner:", error);
    throw error;
  }
}

/**
 * Updates a banner. Sent as POST + _method=PUT to support file uploads.
 * (POST /v1/cms/banners/{id})
 */
export async function updateBanner({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<Banner> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_BANNERS}/${id}`,
      method: "post",
      data: formData,
      transformRequest: [(data) => data],
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update banner with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a banner. (DELETE /v1/cms/banners/{id})
 */
export async function deleteBanner(id: string | number) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_BANNERS}/${id}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete banner with id ${id}:`, error);
    throw error;
  }
}
