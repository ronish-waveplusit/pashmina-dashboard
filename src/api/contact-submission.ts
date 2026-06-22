import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { ContactSubmission } from "../types/contact-submission";

interface GetContactSubmissionsParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
}

/**
 * Fetches a paginated list of contact submissions.
 * (GET /v1/cms/contact-submissions)
 */
export async function getContactSubmissions(
  params: GetContactSubmissionsParams
): Promise<PaginatedResponse<ContactSubmission>> {
  const response = await http({
    url: apiRoutes.GET_CONTACT_SUBMISSIONS,
    method: "get",
    params,
  });
  return response.data.data;
}

/**
 * Fetches a single submission. The backend marks it as read on show.
 * (GET /v1/cms/contact-submissions/{id})
 */
export async function getContactSubmission(
  id: string | number
): Promise<ContactSubmission> {
  const response = await http({
    url: `${apiRoutes.GET_CONTACT_SUBMISSIONS}/${id}`,
    method: "get",
  });
  return response.data.data;
}

/**
 * Deletes a submission. (DELETE /v1/cms/contact-submissions/{id})
 */
export async function deleteContactSubmission(id: string | number) {
  try {
    const response = await http({
      url: `${apiRoutes.GET_CONTACT_SUBMISSIONS}/${id}`,
      method: "delete",
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to delete submission with id ${id}:`, error);
    throw error;
  }
}
