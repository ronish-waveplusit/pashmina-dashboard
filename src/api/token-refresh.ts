import { apiRoutes } from "../constants/RouteConstants";
import http from "../utils/helper/http";

export function fetchRefreshToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  return http({
    url: apiRoutes.REFRESH_TOKEN,
    method: "post",
    data: { refreshToken: refreshToken },
  });
}
