import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

import { PaginatedResponse } from "../types/pagination";
import { CategoryPayload } from "../types/category";

interface GetTransactionCategoryParams {
  page?: number;
  search?: string;
  per_page?: number;
}
/**
 * Fetches a list of all TransactionCategory. (GET /transaction-categories)
 * This is an improved version of your original function.
 */
export async function getTransactionCategory(
  params: GetTransactionCategoryParams
): Promise<PaginatedResponse<CategoryPayload>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT_CATEGORIES,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}


export async function getTransactionCategoryByBranchId(
  branch_id: string | number,
  params?: GetTransactionCategoryParams
): Promise<PaginatedResponse<CategoryPayload>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT_CATEGORIES + `/branch/${branch_id}`,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}
/**
 * Fetches a single course by its ID. (GET /transaction-categories)/{id})
 * @param transactionCategoryId The ID of the course to retrieve.
 */
export async function getTransactionCategoryById(
  transactionCategoryId: string | number
) {
  try {
    const response = await http({
      // Dynamically construct the URL with the course ID
      url: `${apiRoutes.GET_PRODUCT_CATEGORIES}/${transactionCategoryId}`,
      method: "get",
    });
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to fetch course with id ${transactionCategoryId}:`,
      error
    );
    throw error;
  }
}

/**
 * Creates a new course. (POST /transaction-categories)
 * @param data The course data matching the CoursePayload type.
 */
export async function createTransactionCategory(
  data: CategoryPayload | FormData
) {
  try {
    const response = await http({
      url: apiRoutes.GET_PRODUCT_CATEGORIES,
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

/**
 * Updates an existing course by its ID. (PUT /transaction-categories)/{id})
 * @param transactionCategoryId The ID of the course to update.
 * @param data The data to update. Can be a partial object.
 */
export async function updateTransactionCategory({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<CategoryPayload> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT_CATEGORIES}/${id}`,
      method: "put",
      data: formData,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update course with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a course by its ID. (DELETE /transaction-categories)/{id})
 * @param transactionCategoryId The ID of the course to delete.
 */
export async function deleteTransactionCategory(
  transactionCategoryId: string | number
) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT_CATEGORIES}/${transactionCategoryId}`,
      method: "delete",
    });
    // DELETE requests often return a 204 No Content status with an empty body
    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete course with id ${transactionCategoryId}:`,
      error
    );
    throw error;
  }
}
