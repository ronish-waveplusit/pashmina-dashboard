import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

import { PaginatedResponse } from "../types/pagination";
import { FAQ } from "../types/faq";

interface GetFAQsParams {
  page?: number;
  search?: string;
  per_page?: number;
}
/**
 * Fetches a list of all FAQs. (GET /faqs)
 * This is an improved version of your original function.
 */
export async function getFAQs(
  params: GetFAQsParams
): Promise<PaginatedResponse<FAQ>> {
  const response = await http({
    url: apiRoutes.GET_FAQS,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}


export async function getFAQsByBranchId(
  branch_id: string | number,
  params?: GetFAQsParams
): Promise<PaginatedResponse<FAQ>> {
  const response = await http({
    url: apiRoutes.GET_FAQS + `/branch/${branch_id}`,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}
/**
 * Fetches a single FAQ by its ID. (GET /faqs/{id})
 * @param faqId The ID of the FAQ to retrieve.
 */
export async function getFAQById(
  faqId: string | number
) {
  try {
    const response = await http({
      // Dynamically construct the URL with the FAQ ID
      url: `${apiRoutes.GET_FAQS}/${faqId}`,
      method: "get",
    });
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to fetch FAQ with id ${faqId}:`,
      error
    );
    throw error;
  }
}

/**
 * Creates a new FAQ. (POST /faqs)
 * @param data The FAQ data matching the FAQ type.
 */
export async function createFAQ(
  data: FAQ | FormData
) {
  try {
    const response = await http({
      url: apiRoutes.GET_FAQS,
      method: "post",
      data: data,
       headers: {
        'Content-Type': 'multipart/form-data', 
      } 
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    throw error;
  }
}

/**
 * Updates an existing FAQ by its ID. (PUT /faqs/{id})
 * @param id The ID of the FAQ to update.
 * @param formData The data to update. Can be a partial object.
 */
export async function updateFAQ({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<FAQ> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_FAQS}/${id}`,
      method: "post",
      data: formData,
      transformRequest: [(data) => data], 
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update FAQ with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a FAQ by its ID. (DELETE /faqs/{id})
 * @param faqId The ID of the FAQ to delete.
 */
export async function deleteFAQ(
  faqId: string | number
) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_FAQS}/${faqId}`,
      method: "delete",
    });
    // DELETE requests often return a 204 No Content status with an empty body
    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete FAQ with id ${faqId}:`,
      error
    );
    throw error;
  }
}