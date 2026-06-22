import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { Page } from "../types/page";

interface GetPagesParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
}

/**
 * Fetches a paginated list of CMS pages. (GET /v1/cms/pages)
 */
export async function getPages(
  params: GetPagesParams
): Promise<PaginatedResponse<Page>> {
  const response = await http({
    url: apiRoutes.GET_PAGES,
    method: "get",
    params,
  });
  return response.data.data;
}

/**
 * Creates a new page. (POST /v1/cms/pages)
 */
export async function createPage(data: FormData): Promise<Page> {
  try {
    const response = await http({
      url: apiRoutes.GET_PAGES,
      method: "post",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create page:", error);
    throw error;
  }
}

/**
 * Updates a page. Sent as POST + _method=PUT to support file uploads.
 * (POST /v1/cms/pages/{id})
 */
export async function updatePage({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<Page> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PAGES}/${id}`,
      method: "post",
      data: formData,
      transformRequest: [(data) => data],
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update page with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a page. (DELETE /v1/cms/pages/{id})
 */
export async function deletePage(id: string | number) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PAGES}/${id}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete page with id ${id}:`, error);
    throw error;
  }
}
