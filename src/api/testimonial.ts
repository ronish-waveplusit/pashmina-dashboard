import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { Testimonial, TestimonialPayload } from "../types/testimonial";

interface GetTestimonialsParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
}

/**
 * Fetches a paginated list of testimonials. (GET /v1/cms/testimonials)
 */
export async function getTestimonials(
  params: GetTestimonialsParams
): Promise<PaginatedResponse<Testimonial>> {
  const response = await http({
    url: apiRoutes.GET_TESTIMONIALS,
    method: "get",
    params,
  });
  return response.data.data;
}

/**
 * Creates a new testimonial. (POST /v1/cms/testimonials)
 */
export async function createTestimonial(
  data: TestimonialPayload
): Promise<Testimonial> {
  try {
    const response = await http({
      url: apiRoutes.GET_TESTIMONIALS,
      method: "post",
      data,
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    throw error;
  }
}

/**
 * Updates an existing testimonial. (PUT /v1/cms/testimonials/{id})
 */
export async function updateTestimonial({
  id,
  data,
}: {
  id: string | number;
  data: TestimonialPayload;
}): Promise<Testimonial> {
  try {
    const response = await http({
      url: `${apiRoutes.GET_TESTIMONIALS}/${id}`,
      method: "put",
      data,
    });
    return response.data.data;
  } catch (error) {
    console.error(`Failed to update testimonial with id ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a testimonial by id. (DELETE /v1/cms/testimonials/{id})
 */
export async function deleteTestimonial(id: string | number) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_TESTIMONIALS}/${id}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete testimonial with id ${id}:`, error);
    throw error;
  }
}
