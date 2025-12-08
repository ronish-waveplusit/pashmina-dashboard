import { AxiosError, AxiosResponse } from "axios";

import { fetchRefreshToken } from "../api/token-refresh";
import * as authService from "../services/auth";
import { getTokens, setTokens } from "./helper/token";
import http from "./helper/http";
import { PUBLIC_ROUTES } from "../routes/url.constants";

const AUTHORIZATION_HEADER = "Authorization";

const clearCacheAndLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("rtk_exp");
  localStorage.removeItem("persist:root");
  window.location.hash = "/login";
};

/*** Build authorization header** @param {string} accessToken* @returns {string}*/ function buildAuthHeader(
  accessToken: string
) {
  return `Bearer ${accessToken}`;
}
/*** Interceptor to add authentication header for all requests.** @param {object} request* @returns {object}*/
export function requestInterceptor(request: any) {
  // Modify the request here as needed
  const accessToken = authService.getAccessToken();
  if (
    request.headers &&
    accessToken &&
    !request.headers[AUTHORIZATION_HEADER]
  ) {
    request.headers[AUTHORIZATION_HEADER] = buildAuthHeader(accessToken);
  }

  return request;
}
/*** Success response Interceptor for refresh token.** @param sucess* @returns {object}*/
export async function responseSuccessInterceptor(response: AxiosResponse) {
  // const originalRequest = response.config;
  const isPasswordForceful =
    Boolean(Number(localStorage.getItem("_meta_pwd_frc"))) || false;
  const isPasswordReset =
    response.data.message?.includes("change_your_password") || false;
  const isPasswordResetByAdmin = isPasswordReset && !isPasswordForceful;

  if (isPasswordResetByAdmin) {
    console.warn("Admin-initiated password reset detected, logging out");
    clearCacheAndLogout();
  }

  return response;
}
/*** Interceptor to refresh access token.** @param {object} error* @returns {object}*/

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

export async function responseErrorInterceptor(error: AxiosError) {
  const originalRequest: any = error.config;

  if (error?.response?.status === 401 && originalRequest.url === "/refresh") {
    clearCacheAndLogout();
    return Promise.reject(error);
  }
  // Skip token refresh for public routes or refresh token endpoint
  if (
    error?.response?.status === 401 &&
    (PUBLIC_ROUTES.includes(originalRequest.url) ||
      originalRequest.url === "/refresh")
  ) {
    console.warn(
      "401 error on public route or refresh endpoint, rejecting error"
    );
    clearCacheAndLogout();
    return Promise.reject(error);
  }
  // Handle 401 errors for non-public routes by attempting token refresh
  if (error?.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers[AUTHORIZATION_HEADER] =
              buildAuthHeader(token);
            resolve(http(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    isRefreshing = true;

    try {
      const { refreshToken } = getTokens();

      const response = await fetchRefreshToken({ refreshToken });
      const {
        accessToken,
        refreshToken: newRefreshToken,
        refreshTokenExpiry,
      } = response.data.data || {};

      if (accessToken) {
        setTokens({
          accessToken,
          refreshToken: newRefreshToken,
          refreshTokenExpiry,
        });

        originalRequest.headers[AUTHORIZATION_HEADER] =
          buildAuthHeader(accessToken);

        processQueue(null, accessToken);
        return http(originalRequest);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearCacheAndLogout();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
}
