import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

import { PaginatedResponse } from "../types/pagination";
import { ProductFormData } from "../types/product";

interface GetProductParams {
  page?: number;
  search?: string;
  per_page?: number;
}
/**
 * Fetches a list of all TransactionCategory. (GET /transaction-categories)
 * This is an improved version of your original function.
 */
export async function getProduct(
  params: GetProductParams
): Promise<PaginatedResponse<ProductFormData>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}


export async function getProductByBranchId(
  branch_id: string | number,
  params?: GetProductParams
): Promise<PaginatedResponse<ProductFormData>> {
  const response = await http({
    url: apiRoutes.GET_PRODUCT + `/branch/${branch_id}`,
    method: "get",
    params: params,
  });
  // The API nests the paginated object under a "data" key
  return response.data.data;
}
/**
 * Fetches a single course by its ID. (GET /transaction-categories)/{id})
 * @param productId The ID of the course to retrieve.
 */
export async function getProductById(
  productId: string | number
) {
  try {
    const response = await http({
      // Dynamically construct the URL with the course ID
      url: `${apiRoutes.GET_PRODUCT}/${productId}`,
      method: "get",
    });
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to fetch course with id ${productId}:`,
      error
    );
    throw error;
  }
}

/**
 * Creates a new course. (POST /transaction-categories)
 * @param data The course data matching the CoursePayload type.
 */
export async function createProduct(
  data: ProductFormData | FormData
) {
  try {
    const response = await http({
      url: apiRoutes.GET_PRODUCT,
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
 * @param productId The ID of the course to update.
 * @param data The data to update. Can be a partial object.
 */
export async function updateProduct({
  id,
  formData,
}: {
  id: string | number;
  formData: FormData;
}): Promise<ProductFormData> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT}/${id}`,
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
 * @param productId The ID of the course to delete.
 */
export async function deleteProduct(
  productId: string | number
) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_PRODUCT}/${productId}`,
      method: "delete",
    });
    // DELETE requests often return a 204 No Content status with an empty body
    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete course with id ${productId}:`,
      error
    );
    throw error;
  }
}
