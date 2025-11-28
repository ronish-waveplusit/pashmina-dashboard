import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

type loginDataType = {
  email: string;
  password: string;
};

export async function userLogin(data: loginDataType) {
  try {
    const response = await http({
      url: apiRoutes.GET_TOKEN_BY_PASSOWORD,
      method: "post",
      data: data,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      // Return the API's error response if available
      return error.response.data;
    }
    // Handle cases where no response is available (e.g., network error)
    return {
      message: "ERROR",
      errors: error.message || "Network error or server is unreachable",
    };
  }
}

export function getUser(uid: string) {
  return http({
    url: `/get-user/${uid}`,
    method: "get",
  });
}
