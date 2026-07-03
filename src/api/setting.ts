import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { Setting, SettingPayload } from "../types/setting";

interface GetSettingsParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
}

/**
 * Fetches a paginated list of settings. (GET /v1/cms/settings)
 */
export async function getSettings(
  params: GetSettingsParams
): Promise<PaginatedResponse<Setting>> {
  const response = await http({
    url: apiRoutes.GET_SETTINGS,
    method: "get",
    params,
  });
  return response.data.data;
}

/**
 * Creates a new setting. (POST /v1/cms/settings)
 */
export async function createSetting(data: SettingPayload): Promise<Setting> {
  try {
    const response = await http({
      url: apiRoutes.GET_SETTINGS,
      method: "post",
      data,
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create setting:", error);
    throw error;
  }
}

/**
 * Updates an existing setting. (PUT /v1/cms/settings/{id})
 */
export async function updateSetting({
  id,
  data,
}: {
  id: string | number;
  data: SettingPayload;
}): Promise<Setting> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_SETTINGS}/${id}`,
      method: "put",
      data,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update setting with id ${id}:`, error);
    throw error;
  }
}

/**
 * Sends one branding change (logo or favicon) to the settings endpoint.
 * - Upload: POST multipart FormData with `key` + `group` + the `logo`/`favicon`
 *   binary.
 * - Delete: PUT with just `delete_logo` / `delete_favicon` = "1".
 * (POST/PUT /v1/cms/settings)
 */
export async function saveBranding(
  data: FormData | Record<string, unknown>,
  method: "post" | "put" = "post"
): Promise<unknown> {
  try {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;
    const response = await http({
      url: apiRoutes.GET_SETTINGS,
      method,
      data,
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to save branding:", error);
    throw error;
  }
}

/**
 * Deletes a setting by id. (DELETE /v1/cms/settings/{id})
 */
export async function deleteSetting(id: string | number) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_SETTINGS}/${id}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete setting with id ${id}:`, error);
    throw error;
  }
}
