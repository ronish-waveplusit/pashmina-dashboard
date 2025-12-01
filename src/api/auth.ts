import http from "../utils/helper/http";
import { apiRoutes } from "../constants/RouteConstants";

type loginDataType = {
  email: string;
  password: string;
};

export async function userLogin(data: loginDataType) {
  try {
    const response = await http.post(apiRoutes.GET_TOKEN_BY_PASSOWORD, data);
    const result = response.data;

    if (result.message !== "SUCCESS") {
      throw new Error(result.errors || result.message || "Login failed");
    }

    return result;
  } catch (error: any) {
    // Re-throw with clean message for UI
    throw new Error(
      error.response?.data?.errors ||
      error.response?.data?.message ||
      error.message ||
      "Login failed"
    );
  }
}
export function getUser(uid: string) {
  return http({
    url: `/get-user/${uid}`,
    method: "get",
  });
}
