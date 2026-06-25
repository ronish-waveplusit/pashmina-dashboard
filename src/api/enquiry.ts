import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";
import { PaginatedResponse } from "../types/pagination";
import { Enquiry, EnquiryStatus } from "../types/enquiry";

interface GetEnquiryParams {
  page?: number;
  search?: string;
  per_page?: number;
  paginate?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  status?: EnquiryStatus;
}

/**
 * Fetch paginated enquiry list
 */
export async function getEnquiries(
  params?: GetEnquiryParams
): Promise<PaginatedResponse<Enquiry>> {
  const response = await http({
    url: apiRoutes.GET_ENQUIRY,
    method: "get",
    params,
  });

  return response.data.data;
}

/**
 * Fetch single enquiry by ID
 */
export async function getEnquiryById(
  enquiryId: string | number
): Promise<Enquiry> {
  const response = await http({
    url: `${apiRoutes.GET_ENQUIRY}/${enquiryId}`,
    method: "get",
  });

  return response.data.data;
}

/**
 * Update an enquiry's status (new | contacted | closed)
 */
export async function updateEnquiryStatus(
  enquiryId: string | number,
  status: EnquiryStatus
): Promise<Enquiry> {
  const response = await http({
    url: `${apiRoutes.GET_ENQUIRY}/${enquiryId}`,
    method: "patch",
    data: { status },
  });

  return response.data.data;
}

/**
 * Delete an enquiry by ID
 */
export async function deleteEnquiry(
  enquiryId: string | number
): Promise<void> {
  await http({
    url: `${apiRoutes.GET_ENQUIRY}/${enquiryId}`,
    method: "delete",
  });
}
