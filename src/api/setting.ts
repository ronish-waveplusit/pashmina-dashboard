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

export type MediaSettingKey = "logo_image" | "favicon_image";

export interface MediaSettingResponse {
  message: string;
  key: MediaSettingKey;
  url: string;
}

/**
 * Uploads one branding image (logo or favicon). Replace-only: POSTs a multipart
 * FormData with `key` (logo_image | favicon_image) + `file` (binary) and returns
 * the saved `{ key, url }`. (POST cms/website-settings/media-settings)
 */
export async function saveBranding(
  key: MediaSettingKey,
  file: File
): Promise<MediaSettingResponse> {
  try {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);
    const response = await http({
      url: apiRoutes.SAVE_MEDIA_SETTING,
      method: "post",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
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
