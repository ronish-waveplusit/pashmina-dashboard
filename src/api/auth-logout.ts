import { apiRoutes } from "../constants/RouteConstants";
import http from "../utils/helper/http";
import { getRefreshToken } from "../utils/helper/token";

export function authLogout() {
  const refreshToken = getRefreshToken();

  return http({
    url: apiRoutes.AUTH_LOGOUT,
    method: "POST",
    data: {
      refreshToken: refreshToken || undefined,
    },
  });
}
