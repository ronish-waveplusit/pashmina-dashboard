import http from "./utils/helper/http";

import * as interceptors from "./utils/interceptors";

/**
 * Initialize interceptors for the application.
 */
function initInterceptors() {
  http.interceptors.request.use(interceptors.requestInterceptor);
  http.interceptors.response.use(
    interceptors.responseSuccessInterceptor,
    /**
     * This interceptor checks if the response had a 401 status code, which means
     * that the access token used for the request has expired. It then refreshes
     * the access token and resends the original request.
     */
    interceptors.responseErrorInterceptor
  );
}

export default function init() {
  initInterceptors();
}